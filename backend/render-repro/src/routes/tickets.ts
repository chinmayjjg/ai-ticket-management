import { Router } from 'express';
import {
  createTicket,
  rewriteDescription,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  getTicketStats
} from '../controllers/ticketController';
import { createTicketValidation, rewriteDescriptionValidation, updateTicketValidation } from '../validators';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// All ticket routes require authentication
router.use(authenticateToken);

// Ticket CRUD operations
router.post('/', createTicketValidation, createTicket);
router.post('/rewrite-description', rewriteDescriptionValidation, rewriteDescription);
router.get('/', getTickets);
router.get('/stats', getTicketStats);
router.get('/:id', getTicketById);
router.patch('/:id', updateTicketValidation, updateTicket);

// Admin only routes
router.delete('/:id', requireAdmin, deleteTicket);

export default router;
