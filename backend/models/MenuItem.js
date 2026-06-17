import pool from '../config/db.js';

/**
 * MenuItem Model — Database queries for menu_items + nutrition_info tables
 */
const MenuItemModel = {
  /**
   * Get all menu items with nutrition info
   */
  async getAll() {
    const [rows] = await pool.query(
      `SELECT m.*, 
              n.calories, n.protein, n.carbs, n.fat
       FROM menu_items m
       LEFT JOIN nutrition_info n ON m.id = n.menu_item_id
       ORDER BY m.sort_order ASC, m.created_at DESC`
    );
    return rows.map(this._formatRow);
  },

  /**
   * Get available menu items (for public menu)
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
    return rows.map(this._formatRow);
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
    return rows.map(this._formatRow);
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
    return rows.map(this._formatRow);
  },

  /**
   * Get a single item by ID with full details
   */
  async getById(id) {
    const [rows] = await pool.query(
      `SELECT m.*, 
              n.calories, n.protein, n.carbs, n.fat
       FROM menu_items m
       LEFT JOIN nutrition_info n ON m.id = n.menu_item_id
       WHERE m.id = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    return this._formatRow(rows[0]);
  },

  /**
   * Create a new menu item with nutrition info
   */
  async create(data) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert menu item
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

      // Insert nutrition info if provided
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

      // Update menu item
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

      // Upsert nutrition info
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
   * Delete a menu item (cascades to nutrition_info, modifiers, etc.)
   */
  async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM menu_items WHERE id = ?',
      [id]
    );
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
    return rows.map(this._formatRow);
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

  /**
   * Format a database row to match the frontend expected shape
   * Parses JSON columns and structures nutrition as nested object
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
      nutrition: {
        calories: row.calories || '0',
        protein: row.protein || '0g',
        carbs: row.carbs || '0g',
        fat: row.fat || '0g',
      },
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
};

export default MenuItemModel;
