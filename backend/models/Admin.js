import pool from '../config/db.js';
import bcrypt from 'bcrypt';

/**
 * AdminUser Model — Database queries for admin_users table
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
   * Validate password against stored hash
   */
  async validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  /**
   * Create a new admin user
   */
  async create({ username, password, full_name, role }) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      `INSERT INTO admin_users (username, password_hash, full_name, role)
       VALUES (?, ?, ?, ?)`,
      [username, password_hash, full_name, role || 'staff']
    );
    return { id: result.insertId, username, full_name, role };
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
   * Hash a password (utility for seeding)
   */
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
};

export default AdminModel;
