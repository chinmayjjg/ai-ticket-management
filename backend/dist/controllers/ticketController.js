"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTicketStats = exports.deleteTicket = exports.updateTicket = exports.getTicketById = exports.getTickets = exports.createTicket = void 0;
const express_validator_1 = require("express-validator");
const Ticket_1 = require("../models/Ticket");
const User_1 = require("../models/User");
const aiCategorizer_1 = require("../services/aiCategorizer");
const mongoose_1 = __importDefault(require("mongoose"));
const createTicket = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
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
        const aiResult = await aiCategorizer_1.AICategorizer.categorizeWithAI(title, description);
        // Get a random agent for assignment
        const assignedAgentId = await aiCategorizer_1.AICategorizer.getRandomAgent();
        if (!assignedAgentId) {
            return res.status(500).json({
                success: false,
                message: 'No agents available for assignment'
            });
        }
        // Create ticket with AI-determined category and priority (override user priority if needed)
        const ticket = new Ticket_1.Ticket({
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
    }
    catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.createTicket = createTicket;
const getTickets = async (req, res) => {
    try {
        const { status, category, priority, assignedTo, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        // Build filter object
        const filter = {};
        // For regular agents, only show their assigned tickets
        if (req.user?.role === 'agent') {
            filter.assignedTo = req.user.id;
        }
        if (status)
            filter.status = status;
        if (category)
            filter.category = category;
        if (priority)
            filter.priority = priority;
        if (assignedTo && req.user?.role === 'admin') {
            filter.assignedTo = assignedTo;
        }
        // Pagination
        const pageNumber = Math.max(1, parseInt(page));
        const limitNumber = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 per page
        const skip = (pageNumber - 1) * limitNumber;
        // Sorting
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
        // Get tickets with pagination
        const tickets = await Ticket_1.Ticket.find(filter)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNumber);
        // Get total count for pagination
        const totalTickets = await Ticket_1.Ticket.countDocuments(filter);
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
    }
    catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.getTickets = getTickets;
const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID'
            });
        }
        const ticket = await Ticket_1.Ticket.findById(id)
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
            let assignedToId;
            if (typeof ticket.assignedTo === 'object' && ticket.assignedTo !== null && '_id' in ticket.assignedTo) {
                assignedToId = ticket.assignedTo._id.toString();
            }
            else if (typeof ticket.assignedTo === 'string') {
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
    }
    catch (error) {
        console.error('Get ticket by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.getTicketById = getTicketById;
const updateTicket = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }
        const { id } = req.params;
        const { status, priority, assignedTo } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID'
            });
        }
        const ticket = await Ticket_1.Ticket.findById(id);
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
        if (status)
            ticket.status = status;
        if (priority && isAdmin)
            ticket.priority = priority; // Only admins can change priority
        if (assignedTo && isAdmin) {
            // Verify the assigned user exists and is an agent
            const assignedUser = await User_1.User.findById(assignedTo);
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
    }
    catch (error) {
        console.error('Update ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.updateTicket = updateTicket;
const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID'
            });
        }
        const ticket = await Ticket_1.Ticket.findById(id);
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
        await Ticket_1.Ticket.findByIdAndDelete(id);
        res.json({
            success: true,
            message: 'Ticket deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.deleteTicket = deleteTicket;
const getTicketStats = async (req, res) => {
    try {
        const filter = {};
        // For agents, only show stats for their tickets
        if (req.user?.role === 'agent') {
            filter.assignedTo = req.user.id;
        }
        const [totalTickets, openTickets, inProgressTickets, resolvedTickets, closedTickets, priorityStats, categoryStats] = await Promise.all([
            Ticket_1.Ticket.countDocuments(filter),
            Ticket_1.Ticket.countDocuments({ ...filter, status: 'open' }),
            Ticket_1.Ticket.countDocuments({ ...filter, status: 'in-progress' }),
            Ticket_1.Ticket.countDocuments({ ...filter, status: 'resolved' }),
            Ticket_1.Ticket.countDocuments({ ...filter, status: 'closed' }),
            Ticket_1.Ticket.aggregate([
                { $match: filter },
                { $group: { _id: '$priority', count: { $sum: 1 } } }
            ]),
            Ticket_1.Ticket.aggregate([
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
    }
    catch (error) {
        console.error('Get ticket stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.getTicketStats = getTicketStats;
