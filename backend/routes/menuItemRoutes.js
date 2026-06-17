import { Router } from 'express';
import MenuItemController from '../controllers/menuItemController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', MenuItemController.getAll);
router.get('/:id', MenuItemController.getById);

// Protected routes (admin only)
router.post('/', authMiddleware, MenuItemController.create);
router.put('/:id', authMiddleware, MenuItemController.update);
router.delete('/:id', authMiddleware, MenuItemController.delete);
router.patch('/:id/toggle', authMiddleware, MenuItemController.toggleAvailability);

export default router;
