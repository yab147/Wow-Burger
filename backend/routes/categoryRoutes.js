import { Router } from 'express';
import CategoryController from '../controllers/categoryController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', CategoryController.getAll);
router.get('/stats/counts', CategoryController.getStats);
router.get('/:id', CategoryController.getById);

// Protected routes (admin only)
router.post('/', authMiddleware, CategoryController.create);
router.put('/:id', authMiddleware, CategoryController.update);
router.delete('/:id', authMiddleware, CategoryController.delete);

export default router;
