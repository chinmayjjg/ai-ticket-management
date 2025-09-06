"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTicketValidation = exports.createTicketValidation = exports.loginValidation = exports.signupValidation = void 0;
const express_validator_1 = require("express-validator");
// Auth validation schemas
exports.signupValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['agent', 'admin'])
        .withMessage('Role must be either agent or admin')
];
exports.loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
];
// Ticket validation schemas
exports.createTicketValidation = [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Priority must be one of: low, medium, high, urgent')
];
exports.updateTicketValidation = [
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['open', 'in-progress', 'resolved', 'closed'])
        .withMessage('Status must be one of: open, in-progress, resolved, closed'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Priority must be one of: low, medium, high, urgent'),
    (0, express_validator_1.body)('assignedTo')
        .optional()
        .isMongoId()
        .withMessage('Assigned user must be a valid user ID')
];
