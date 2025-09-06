"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticketController_1 = require("../controllers/ticketController");
const validators_1 = require("../validators");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All ticket routes require authentication
router.use(auth_1.authenticateToken);
// Ticket CRUD operations
router.post('/', validators_1.createTicketValidation, ticketController_1.createTicket);
router.get('/', ticketController_1.getTickets);
router.get('/stats', ticketController_1.getTicketStats);
router.get('/:id', ticketController_1.getTicketById);
router.patch('/:id', validators_1.updateTicketValidation, ticketController_1.updateTicket);
// Admin only routes
router.delete('/:id', auth_1.requireAdmin, ticketController_1.deleteTicket);
exports.default = router;
