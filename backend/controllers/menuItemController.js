import MenuItemModel from '../models/MenuItem.js';

/**
 * MenuItem Controller — Handles menu item CRUD + pagination + analytics
 */
const MenuItemController = {
  /**
   * GET /api/menu-items
   * Admin: server-side paginated + filtered list
   * Public: available items only
   */
  async getAll(req, res, next) {
    try {
      const { category, search, featured, page, limit, available } = req.query;

      // Admin requests with pagination params → use paginated endpoint
      if (req.admin && (page || limit)) {
        const result = await MenuItemModel.getPaginated({
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
          search: search || '',
          category: category || '',
          available: available || '',
          featured: featured || '',
        });
        return res.json({ success: true, ...result });
      }

      let items;
      if (search) {
        items = await MenuItemModel.search(search);
      } else if (featured === 'true') {
        items = await MenuItemModel.getFeatured();
      } else if (category) {
        items = await MenuItemModel.getByCategory(category);
      } else if (req.admin) {
        items = await MenuItemModel.getAll();
      } else {
        items = await MenuItemModel.getAvailable();
      }

      res.json({ success: true, data: items, count: items.length });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/menu-items/:id
   * Get a single menu item by ID and track view
   */
  async getById(req, res, next) {
    try {
      const item = await MenuItemModel.getById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Menu item not found.' });
      }

      // Track view asynchronously (non-blocking)
      MenuItemModel.incrementViewCount(req.params.id).catch(() => {});

      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/menu-items (admin only)
   */
  async create(req, res, next) {
    try {
      const { id, name, category_id, base_price, price } = req.body;
      if (!id || !name || !category_id) {
        return res.status(400).json({ success: false, message: 'Item ID, name, and category are required.' });
      }
      const itemData = { ...req.body, base_price: base_price || price };
      const item = await MenuItemModel.create(itemData);
      res.status(201).json({ success: true, message: 'Menu item created successfully.', data: item });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/menu-items/:id (admin only)
   */
  async update(req, res, next) {
    try {
      const existing = await MenuItemModel.getById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Menu item not found.' });
      }
      const updateData = { ...req.body, base_price: req.body.base_price || req.body.price };
      const item = await MenuItemModel.update(req.params.id, updateData);
      res.json({ success: true, message: 'Menu item updated successfully.', data: item });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/menu-items/:id (admin only)
   */
  async delete(req, res, next) {
    try {
      const deleted = await MenuItemModel.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Menu item not found.' });
      }
      res.json({ success: true, message: 'Menu item deleted successfully.' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/menu-items/:id/toggle (admin only)
   */
  async toggleAvailability(req, res, next) {
    try {
      const item = await MenuItemModel.toggleAvailability(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Menu item not found.' });
      }
      res.json({
        success: true,
        message: `Item ${item.is_available ? 'enabled' : 'disabled'} successfully.`,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  },

  // ——— Image Gallery ———

  /**
   * POST /api/menu-items/:id/images (admin only)
   * Upload image for an item
   */
  async addImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file uploaded.' });
      }

      const { getFileUrl } = await import('../middleware/upload.js');
      const image_url = getFileUrl(req.file.filename);
      const { alt_text, sort_order, is_primary } = req.body;

      const image = await MenuItemModel.addImage(req.params.id, {
        image_url,
        alt_text: alt_text || req.body.alt_text || '',
        sort_order: parseInt(sort_order) || 0,
        is_primary: is_primary === 'true' || is_primary === true,
      });

      // If this is the primary image, also update item's image_url
      if (is_primary === 'true' || is_primary === true) {
        await MenuItemModel.update(req.params.id, {
          ...(await MenuItemModel.getById(req.params.id)),
          image_url,
        });
      }

      res.status(201).json({ success: true, message: 'Image uploaded successfully.', data: image });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/menu-items/:id/images/:imageId (admin only)
   */
  async deleteImage(req, res, next) {
    try {
      const deleted = await MenuItemModel.deleteImage(req.params.imageId);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Image not found.' });
      }
      res.json({ success: true, message: 'Image deleted successfully.' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/menu-items/analytics/top-viewed (admin only)
   */
  async getTopViewed(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const items = await MenuItemModel.getTopViewed(limit);
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  },
};

export default MenuItemController;
