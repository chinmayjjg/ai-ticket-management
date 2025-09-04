import { Router } from 'express';
import { signup, login, getProfile } from '../controllers/authController';
import { signupValidation, loginValidation } from '../validators';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router;