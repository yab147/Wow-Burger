import { Router } from 'express';
import MenuItemController from '../controllers/menuItemController.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// ——— Analytics (must be before /:id) ———
router.get('/analytics/top-viewed', authMiddleware, MenuItemController.getTopViewed);

// ——— Public routes (optionalAuth sets req.admin if token present) ———
router.get('/', optionalAuth, MenuItemController.getAll);
router.get('/:id', optionalAuth, MenuItemController.getById);

// ——— Protected routes (admin only) ———
router.post('/', authMiddleware, MenuItemController.create);
router.put('/:id', authMiddleware, MenuItemController.update);
router.delete('/:id', authMiddleware, MenuItemController.delete);
router.patch('/:id/toggle', authMiddleware, MenuItemController.toggleAvailability);

// ——— Image Gallery ———
router.post('/:id/images', authMiddleware, upload.single('image'), MenuItemController.addImage);
router.delete('/:id/images/:imageId', authMiddleware, MenuItemController.deleteImage);

export default router;
