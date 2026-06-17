import CategoryModel from '../models/Category.js';

/**
 * Category Controller — Handles category CRUD operations
 */
const CategoryController = {
  /**
   * GET /api/categories
   * Get all categories (public: active only, admin: all)
   */
  async getAll(req, res, next) {
    try {
      const isAdmin = req.admin;
      const categories = isAdmin 
        ? await CategoryModel.getAll()
        : await CategoryModel.getActive();

      res.json({
        success: true,
        data: categories,
        count: categories.length,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/categories/:id
   * Get a single category by ID
   */
  async getById(req, res, next) {
    try {
      const category = await CategoryModel.getById(req.params.id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found.',
        });
      }
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/categories
   * Create a new category (admin only)
   */
  async create(req, res, next) {
    try {
      const { id, name, description, image_url, sort_order, is_active } = req.body;

      if (!id || !name) {
        return res.status(400).json({
          success: false,
          message: 'Category ID and name are required.',
        });
      }

      const category = await CategoryModel.create({
        id, name, description, image_url, sort_order, is_active,
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully.',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/categories/:id
   * Update a category (admin only)
   */
  async update(req, res, next) {
    try {
      const existing = await CategoryModel.getById(req.params.id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Category not found.',
        });
      }

      const category = await CategoryModel.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Category updated successfully.',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/categories/:id
   * Delete a category (admin only)
   */
  async delete(req, res, next) {
    try {
      const deleted = await CategoryModel.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Category not found.',
        });
      }
      res.json({
        success: true,
        message: 'Category deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/categories/stats/counts
   * Get item count per category
   */
  async getStats(req, res, next) {
    try {
      const stats = await CategoryModel.getItemCounts();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },
};

export default CategoryController;
