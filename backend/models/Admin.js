import pool from '../config/db.js';
import bcrypt from 'bcrypt';

/**
 * AdminUser Model — Full CRUD + role management + password change
 */
const AdminModel = {
  /**
   * Find admin user by username
   */
  async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE',
      [username]
    );
    return rows[0] || null;
  },

  /**
   * Find admin user by ID
   */
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, full_name, email, phone, role, is_active, last_login, created_at FROM admin_users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Get all admin users (employee management)
   */
  async getAll() {
    const [rows] = await pool.query(
      'SELECT id, username, full_name, email, phone, role, is_active, last_login, created_at FROM admin_users ORDER BY created_at ASC'
    );
    return rows;
  },

  /**
   * Validate password against stored hash
   */
  async validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  /**
   * Create a new admin user
   */
  async create({ username, password, full_name, email, phone, role }) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      `INSERT INTO admin_users (username, password_hash, full_name, email, phone, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, password_hash, full_name, email || null, phone || null, role || 'staff']
    );
    return this.findById(result.insertId);
  },

  /**
   * Update admin user info (no password)
   */
  async update(id, { full_name, email, phone, role, is_active }) {
    await pool.query(
      `UPDATE admin_users SET full_name = ?, email = ?, phone = ?, role = ?, is_active = ?
       WHERE id = ?`,
      [full_name, email || null, phone || null, role, is_active !== false, id]
    );
    return this.findById(id);
  },

  /**
   * Change password — validates current password first
   */
  async changePassword(id, currentPassword, newPassword) {
    const [rows] = await pool.query('SELECT password_hash FROM admin_users WHERE id = ?', [id]);
    if (!rows[0]) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isValid) throw new Error('Current password is incorrect');

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    await pool.query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [newHash, id]);
    return true;
  },

  /**
   * Admin reset password (super_admin only, no old password needed)
   */
  async resetPassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    await pool.query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [newHash, id]);
    return true;
  },

  /**
   * Delete admin user
   */
  async delete(id) {
    const [result] = await pool.query('DELETE FROM admin_users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id) {
    await pool.query(
      'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  },

  /**
   * Hash a password (utility)
   */
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
};

export default AdminModel;
