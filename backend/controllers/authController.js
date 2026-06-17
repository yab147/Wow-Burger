import AdminModel from '../models/Admin.js';
import { generateToken } from '../middleware/auth.js';

/**
 * Auth Controller — Handles admin authentication
 */
const AuthController = {
  /**
   * POST /api/auth/login
   * Authenticate admin and return JWT token
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required.',
        });
      }

      // Find admin user
      const admin = await AdminModel.findByUsername(username);
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials.',
        });
      }

      // Validate password
      const isValid = await AdminModel.validatePassword(password, admin.password_hash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials.',
        });
      }

      // Update last login
      await AdminModel.updateLastLogin(admin.id);

      // Generate token
      const token = generateToken({
        id: admin.id,
        username: admin.username,
        role: admin.role,
      });

      res.json({
        success: true,
        message: 'Login successful.',
        data: {
          token,
          admin: {
            id: admin.id,
            username: admin.username,
            full_name: admin.full_name,
            role: admin.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/register
   * Create a new admin user (protected - super_admin only)
   */
  async register(req, res, next) {
    try {
      const { username, password, full_name, role } = req.body;

      if (!username || !password || !full_name) {
        return res.status(400).json({
          success: false,
          message: 'Username, password, and full name are required.',
        });
      }

      const admin = await AdminModel.create({ username, password, full_name, role });

      res.status(201).json({
        success: true,
        message: 'Admin user created successfully.',
        data: admin,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/auth/me
   * Get current authenticated admin info
   */
  async me(req, res) {
    res.json({
      success: true,
      data: req.admin,
    });
  },
};

export default AuthController;
