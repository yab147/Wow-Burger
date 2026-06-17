import { Router } from 'express';
import AuthController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/login', AuthController.login);

// Protected routes
router.get('/me', authMiddleware, AuthController.me);
router.post('/register', authMiddleware, AuthController.register);

export default router;
