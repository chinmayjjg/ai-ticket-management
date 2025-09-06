"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validators_1 = require("../validators");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.post('/signup', validators_1.signupValidation, authController_1.signup);
router.post('/login', validators_1.loginValidation, authController_1.login);
// Protected routes
router.get('/profile', auth_1.authenticateToken, authController_1.getProfile);
exports.default = router;
