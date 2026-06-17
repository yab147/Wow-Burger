import pool from '../config/db.js';

/**
 * Category Model — Database queries for categories table
 */
const CategoryModel = {
  /**
   * Get all active categories ordered by sort_order
   */
  async getAll() {
    const [rows] = await pool.query(
      'SELECT * FROM categories ORDER BY sort_order ASC'
    );
    return rows;
  },

  /**
   * Get only active categories (for public menu)
   */
  async getActive() {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE is_active = TRUE ORDER BY sort_order ASC'
    );
    return rows;
  },

  /**
   * Get a single category by ID
   */
  async getById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create a new category
   */
  async create({ id, name, description, image_url, sort_order, is_active }) {
    const [result] = await pool.query(
      `INSERT INTO categories (id, name, description, image_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, description || null, image_url || null, sort_order || 0, is_active !== false]
    );
    return this.getById(id);
  },

  /**
   * Update an existing category
   */
  async update(id, { name, description, image_url, sort_order, is_active }) {
    await pool.query(
      `UPDATE categories 
       SET name = ?, description = ?, image_url = ?, sort_order = ?, is_active = ?
       WHERE id = ?`,
      [name, description || null, image_url || null, sort_order || 0, is_active !== false, id]
    );
    return this.getById(id);
  },

  /**
   * Delete a category
   */
  async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM categories WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Get item count per category
   */
  async getItemCounts() {
    const [rows] = await pool.query(
      `SELECT c.id, c.name, COUNT(m.id) as item_count
       FROM categories c
       LEFT JOIN menu_items m ON c.id = m.category_id
       GROUP BY c.id, c.name
       ORDER BY c.sort_order ASC`
    );
    return rows;
  }
};

export default CategoryModel;
