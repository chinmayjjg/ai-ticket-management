import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Ticket } from '../models/Ticket';
import { User } from '../models/User';
import { AICategorizer } from '../services/aiCategorizer';
import mongoose from 'mongoose';

export const createTicket = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { title, description, priority } = req.body;
    const createdBy = req.user?.id;

    // Use AI to categorize the ticket
    const aiResult = await AICategorizer.categorizeWithAI(title, description);
    
    // Get a random agent for assignment
    const assignedAgentId = await AICategorizer.getRandomAgent();
    
    if (!assignedAgentId) {
      return res.status(500).json({
        success: false,
        message: 'No agents available for assignment'
      });
    }

    // Create ticket with AI-determined category and priority (override user priority if needed)
    const ticket = new Ticket({
      title,
      description,
      priority: priority || aiResult.priority, // Use provided priority or AI suggestion
      category: aiResult.category,
      createdBy,
      assignedTo: assignedAgentId,
      status: 'open'
    });

    await ticket.save();

    // Populate the references for response
    await ticket.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: {
        ticket,
        aiAnalysis: {
          suggestedCategory: aiResult.category,
          suggestedPriority: aiResult.priority,
          confidence: aiResult.confidence
        }
      }
    });
  } catch (error: any) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const getTickets = async (req: Request, res: Response) => {
  try {
    const {
      status,
      category,
      priority,
      assignedTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    // For regular agents, only show their assigned tickets
    if (req.user?.role === 'agent') {
      filter.assignedTo = req.user.id;
    }
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (assignedTo && req.user?.role === 'admin') {
      filter.assignedTo = assignedTo;
    }

    // Pagination
    const pageNumber = Math.max(1, parseInt(page as string));
    const limitNumber = Math.min(50, Math.max(1, parseInt(limit as string))); // Max 50 per page
    const skip = (pageNumber - 1) * limitNumber;

    // Sorting
    const sortObj: any = {};
    sortObj[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Get tickets with pagination
    const tickets = await Ticket.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNumber);

    // Get total count for pagination
    const totalTickets = await Ticket.countDocuments(filter);
    const totalPages = Math.ceil(totalTickets / limitNumber);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalTickets,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1
        }
      }
    });
  } catch (error: any) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const getTicketById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID'
      });
    }

    const ticket = await Ticket.findById(id) 
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user has permission to view this ticket
    if (req.user?.role === 'agent') {
      // assignedTo can be ObjectId or populated user
      let assignedToId: string | undefined;
      if (typeof ticket.assignedTo === 'object' && ticket.assignedTo !== null && '_id' in ticket.assignedTo) {
        assignedToId = (ticket.assignedTo as any)._id.toString();
      } else if (typeof ticket.assignedTo === 'string') {
        assignedToId = ticket.assignedTo;
      }

      if (assignedToId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view tickets assigned to you'
        });
      }
    }

    res.json({
      success: true,
      data: { ticket }
    });
  } catch (error: any) {
    console.error('Get ticket by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const updateTicket = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, priority, assignedTo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID'
      });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check permissions
    const isAdmin = req.user?.role === 'admin';
    const isAssignedAgent = ticket.assignedTo.toString() === req.user?.id;

    if (!isAdmin && !isAssignedAgent) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update tickets assigned to you'
      });
    }

    // Update fields
    if (status) ticket.status = status;
    if (priority && isAdmin) ticket.priority = priority; // Only admins can change priority
    if (assignedTo && isAdmin) {
      // Verify the assigned user exists and is an agent
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser || assignedUser.role !== 'agent') {
        return res.status(400).json({
          success: false,
          message: 'Invalid assigned user'
        });
      }
      ticket.assignedTo = assignedTo;
    }

    await ticket.save();

    // Populate for response
    await ticket.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: { ticket }
    });
  } catch (error: any) {
    console.error('Update ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const deleteTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID'
      });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Only admins can delete tickets
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only admins can delete tickets'
      });
    }

    await Ticket.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const getTicketStats = async (req: Request, res: Response) => {
  try {
    const filter: any = {};
    
    // For agents, only show stats for their tickets
    if (req.user?.role === 'agent') {
      filter.assignedTo = req.user.id;
    }

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      priorityStats,
      categoryStats
    ] = await Promise.all([
      Ticket.countDocuments(filter),
      Ticket.countDocuments({ ...filter, status: 'open' }),
      Ticket.countDocuments({ ...filter, status: 'in-progress' }),
      Ticket.countDocuments({ ...filter, status: 'resolved' }),
      Ticket.countDocuments({ ...filter, status: 'closed' }),
      Ticket.aggregate([
        { $match: filter },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Ticket.aggregate([
        { $match: filter },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total: totalTickets,
          open: openTickets,
          inProgress: inProgressTickets,
          resolved: resolvedTickets,
          closed: closedTickets
        },
        byPriority: priorityStats,
        byCategory: categoryStats
      }
    });
  } catch (error: any) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};