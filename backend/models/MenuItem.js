import pool from '../config/db.js';

/**
 * MenuItem Model — with pagination, filtering, image gallery, view counts
 */
const MenuItemModel = {
  /**
   * Get ALL items with pagination, filtering, sorting
   * Used by admin panel
   */
  async getPaginated({ page = 1, limit = 10, search = '', category = '', available = '', featured = '' } = {}) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(m.name LIKE ? OR m.description LIKE ? OR m.id LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (category) {
      conditions.push('m.category_id = ?');
      params.push(category);
    }
    if (available === 'true') {
      conditions.push('m.is_available = TRUE');
    } else if (available === 'false') {
      conditions.push('m.is_available = FALSE');
    }
    if (featured === 'true') {
      conditions.push('m.is_featured = TRUE');
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM menu_items m ${where}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT m.*, 
              n.calories, n.protein, n.carbs, n.fat,
              iv.view_count
       FROM menu_items m
       LEFT JOIN nutrition_info n ON m.id = n.menu_item_id
       LEFT JOIN item_views iv ON m.id = iv.menu_item_id
       ${where}
       ORDER BY m.sort_order ASC, m.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    return {
      items: rows.map(this._formatRow.bind(this)),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get all menu items with nutrition info (admin, no pagination)
   */
  async getAll() {
    const [rows] = await pool.query(
      `SELECT m.*, 
              n.calories, n.protein, n.carbs, n.fat,
              iv.view_count
       FROM menu_items m
       LEFT JOIN nutrition_info n ON m.id = n.menu_item_id
       LEFT JOIN item_views iv ON m.id = iv.menu_item_id
       ORDER BY m.sort_order ASC, m.created_at DESC`
    );
    return rows.map(this._formatRow.bind(this));
  },

  /**
   * Get available menu items (public menu)
   */
  async getAvailable() {
    const [rows] = await pool.query(
      `SELECT m.*, 
              n.calories, n.protein, n.carbs, n.fat
       FROM menu_items m
       LEFT JOIN nutrition_info n ON m.id = n.menu_item_id
       WHERE m.is_available = TRUE
       ORDER BY m.sort_order ASC, m.created_at DESC`
    );
    return rows.map(this._formatRow.bind(this));
  },

  /**
   * Get items by category
   */
  async getByCategory(categoryId) {
    const [rows] = await pool.query(
      `SELECT m.*, 
              n.calories, n.protein, n.carbs, n.fat
       FROM menu_items m
       LEFT JOIN nutrition_info n ON m.id = n.menu_item_id
       WHERE m.category_id = ? AND m.is_available = TRUE
       ORDER BY m.sort_order ASC`,
      [categoryId]
    );
    return rows.map(this._formatRow.bind(this));
  },

  /**
   * Get featured items
   */
  async getFeatured() {
    const [rows] = await pool.query(
      `SELECT m.*, 
              n.calories, n.protein, n.carbs, n.fat
       FROM menu_items m
       LEFT JOIN nutrition_info n ON m.id = n.menu_item_id
       WHERE m.is_featured = TRUE AND m.is_available = TRUE
       ORDER BY m.rating DESC
       LIMIT 8`
    );
    return rows.map(this._formatRow.bind(this));
  },

  /**
   * Get a single item by ID with full details including gallery images
   */
  async getById(id) {
    const [rows] = await pool.query(
      `SELECT m.*, 
              n.calories, n.protein, n.carbs, n.fat,
              iv.view_count
       FROM menu_items m
       LEFT JOIN nutrition_info n ON m.id = n.menu_item_id
       LEFT JOIN item_views iv ON m.id = iv.menu_item_id
       WHERE m.id = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    const item = this._formatRow(rows[0]);

    // Fetch gallery images
    const [images] = await pool.query(
      'SELECT id, image_url, alt_text, sort_order, is_primary FROM item_images WHERE menu_item_id = ? ORDER BY sort_order ASC',
      [id]
    );
    item.images = images;
    return item;
  },

  /**
   * Increment view count for analytics
   */
  async incrementViewCount(id) {
    await pool.query(
      `INSERT INTO item_views (menu_item_id, view_count, last_viewed_at)
       VALUES (?, 1, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE view_count = view_count + 1, last_viewed_at = CURRENT_TIMESTAMP`,
      [id]
    );
  },

  /**
   * Get top viewed items for analytics dashboard
   */
  async getTopViewed(limit = 10) {
    const [rows] = await pool.query(
      `SELECT m.id, m.name, m.image_url, m.category_id, m.base_price,
              iv.view_count, iv.last_viewed_at
       FROM item_views iv
       JOIN menu_items m ON m.id = iv.menu_item_id
       ORDER BY iv.view_count DESC
       LIMIT ?`,
      [parseInt(limit)]
    );
    return rows;
  },

  /**
   * Create a new menu item with nutrition info
   */
  async create(data) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `INSERT INTO menu_items 
         (id, category_id, name, description, base_price, image_url, badge, rating, 
          is_available, is_featured, ingredients, highlights, dietary_tags, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.id,
          data.category_id,
          data.name,
          data.description || null,
          data.base_price,
          data.image_url || null,
          data.badge || null,
          data.rating || 0.0,
          data.is_available !== false,
          data.is_featured || false,
          JSON.stringify(data.ingredients || []),
          JSON.stringify(data.highlights || []),
          JSON.stringify(data.dietary_tags || []),
          data.sort_order || 0
        ]
      );

      if (data.nutrition) {
        await connection.query(
          `INSERT INTO nutrition_info (menu_item_id, calories, protein, carbs, fat)
           VALUES (?, ?, ?, ?, ?)`,
          [
            data.id,
            data.nutrition.calories || null,
            data.nutrition.protein || null,
            data.nutrition.carbs || null,
            data.nutrition.fat || null
          ]
        );
      }

      await connection.commit();
      return this.getById(data.id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Update an existing menu item
   */
  async update(id, data) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `UPDATE menu_items SET
           category_id = ?, name = ?, description = ?, base_price = ?,
           image_url = ?, badge = ?, rating = ?,
           is_available = ?, is_featured = ?,
           ingredients = ?, highlights = ?, dietary_tags = ?, sort_order = ?
         WHERE id = ?`,
        [
          data.category_id,
          data.name,
          data.description || null,
          data.base_price,
          data.image_url || null,
          data.badge || null,
          data.rating || 0.0,
          data.is_available !== false,
          data.is_featured || false,
          JSON.stringify(data.ingredients || []),
          JSON.stringify(data.highlights || []),
          JSON.stringify(data.dietary_tags || []),
          data.sort_order || 0,
          id
        ]
      );

      if (data.nutrition) {
        await connection.query(
          `INSERT INTO nutrition_info (menu_item_id, calories, protein, carbs, fat)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             calories = VALUES(calories),
             protein = VALUES(protein),
             carbs = VALUES(carbs),
             fat = VALUES(fat)`,
          [
            id,
            data.nutrition.calories || null,
            data.nutrition.protein || null,
            data.nutrition.carbs || null,
            data.nutrition.fat || null
          ]
        );
      }

      await connection.commit();
      return this.getById(id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Delete a menu item
   */
  async delete(id) {
    const [result] = await pool.query('DELETE FROM menu_items WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  /**
   * Search items by name or description
   */
  async search(query) {
    const searchTerm = `%${query}%`;
    const [rows] = await pool.query(
      `SELECT m.*, 
              n.calories, n.protein, n.carbs, n.fat
       FROM menu_items m
       LEFT JOIN nutrition_info n ON m.id = n.menu_item_id
       WHERE (m.name LIKE ? OR m.description LIKE ?) AND m.is_available = TRUE
       ORDER BY m.sort_order ASC`,
      [searchTerm, searchTerm]
    );
    return rows.map(this._formatRow.bind(this));
  },

  /**
   * Toggle availability
   */
  async toggleAvailability(id) {
    await pool.query(
      'UPDATE menu_items SET is_available = NOT is_available WHERE id = ?',
      [id]
    );
    return this.getById(id);
  },

  // ——— Image Gallery ———

  /**
   * Add image to item gallery
   */
  async addImage(itemId, { image_url, alt_text, sort_order = 0, is_primary = false }) {
    if (is_primary) {
      await pool.query('UPDATE item_images SET is_primary = FALSE WHERE menu_item_id = ?', [itemId]);
    }
    const [result] = await pool.query(
      'INSERT INTO item_images (menu_item_id, image_url, alt_text, sort_order, is_primary) VALUES (?, ?, ?, ?, ?)',
      [itemId, image_url, alt_text || null, sort_order, is_primary]
    );
    return { id: result.insertId, menu_item_id: itemId, image_url, alt_text, sort_order, is_primary };
  },

  /**
   * Delete image from gallery
   */
  async deleteImage(imageId) {
    const [result] = await pool.query('DELETE FROM item_images WHERE id = ?', [imageId]);
    return result.affectedRows > 0;
  },

  /**
   * Get all images for item
   */
  async getImages(itemId) {
    const [rows] = await pool.query(
      'SELECT * FROM item_images WHERE menu_item_id = ? ORDER BY sort_order ASC',
      [itemId]
    );
    return rows;
  },

  /**
   * Format a database row to frontend shape
   */
  _formatRow(row) {
    return {
      id: row.id,
      category_id: row.category_id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.base_price),
      base_price: parseFloat(row.base_price),
      image_url: row.image_url,
      badge: row.badge || '',
      rating: row.rating ? row.rating.toString() : '0.0',
      is_available: !!row.is_available,
      is_featured: !!row.is_featured,
      ingredients: typeof row.ingredients === 'string'
        ? JSON.parse(row.ingredients)
        : (row.ingredients || []),
      highlights: typeof row.highlights === 'string'
        ? JSON.parse(row.highlights)
        : (row.highlights || []),
      dietary_tags: typeof row.dietary_tags === 'string'
        ? JSON.parse(row.dietary_tags)
        : (row.dietary_tags || []),
      sort_order: row.sort_order,
      view_count: row.view_count || 0,
      nutrition: {
        calories: row.calories || '0',
        protein: row.protein || '0g',
        carbs: row.carbs || '0g',
        fat: row.fat || '0g',
      },
      images: row.images || [],
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
};

export default MenuItemModel;
