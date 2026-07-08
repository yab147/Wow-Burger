import { Router } from 'express';
import AuthController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// ——— Auth ———
router.post('/login', AuthController.login);
router.get('/me', authMiddleware, AuthController.me);
router.post('/change-password', authMiddleware, AuthController.changePassword);

// ——— Employee Management (super_admin only) ———
router.get('/employees', authMiddleware, AuthController.getEmployees);
router.post('/register', authMiddleware, AuthController.register);
router.put('/employees/:id', authMiddleware, AuthController.updateEmployee);
router.delete('/employees/:id', authMiddleware, AuthController.deleteEmployee);
router.post('/employees/:id/reset-password', authMiddleware, AuthController.resetEmployeePassword);

export default router;
