import MenuItemModel from '../models/MenuItem.js';

/**
 * MenuItem Controller — Handles menu item CRUD operations
 */
const MenuItemController = {
  /**
   * GET /api/menu-items
   * Get all menu items. Admin gets all, public gets only available.
   */
  async getAll(req, res, next) {
    try {
      const { category, search, featured } = req.query;
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

      res.json({
        success: true,
        data: items,
        count: items.length,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/menu-items/:id
   * Get a single menu item by ID
   */
  async getById(req, res, next) {
    try {
      const item = await MenuItemModel.getById(req.params.id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found.',
        });
      }
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/menu-items
   * Create a new menu item (admin only)
   */
  async create(req, res, next) {
    try {
      const { id, name, category_id, base_price, price } = req.body;

      if (!id || !name || !category_id) {
        return res.status(400).json({
          success: false,
          message: 'Item ID, name, and category are required.',
        });
      }

      // Support both base_price and price from frontend
      const itemData = {
        ...req.body,
        base_price: base_price || price,
      };

      const item = await MenuItemModel.create(itemData);

      res.status(201).json({
        success: true,
        message: 'Menu item created successfully.',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/menu-items/:id
   * Update a menu item (admin only)
   */
  async update(req, res, next) {
    try {
      const existing = await MenuItemModel.getById(req.params.id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found.',
        });
      }

      // Support both base_price and price from frontend
      const updateData = {
        ...req.body,
        base_price: req.body.base_price || req.body.price,
      };

      const item = await MenuItemModel.update(req.params.id, updateData);
      res.json({
        success: true,
        message: 'Menu item updated successfully.',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/menu-items/:id
   * Delete a menu item (admin only)
   */
  async delete(req, res, next) {
    try {
      const deleted = await MenuItemModel.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found.',
        });
      }
      res.json({
        success: true,
        message: 'Menu item deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/menu-items/:id/toggle
   * Toggle item availability (admin only)
   */
  async toggleAvailability(req, res, next) {
    try {
      const item = await MenuItemModel.toggleAvailability(req.params.id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found.',
        });
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
};

export default MenuItemController;
