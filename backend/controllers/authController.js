import AdminModel from '../models/Admin.js';
import { generateToken } from '../middleware/auth.js';

/**
 * Auth Controller — Authentication + Employee management + Password change
 */
const AuthController = {
  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
      }

      const admin = await AdminModel.findByUsername(username);
      if (!admin) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const isValid = await AdminModel.validatePassword(password, admin.password_hash);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      await AdminModel.updateLastLogin(admin.id);

      const token = generateToken({ id: admin.id, username: admin.username, role: admin.role });

      res.json({
        success: true,
        message: 'Login successful.',
        data: {
          token,
          admin: { id: admin.id, username: admin.username, full_name: admin.full_name, role: admin.role },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/register (super_admin only)
   */
  async register(req, res, next) {
    try {
      // Role-based permission: only super_admin can create users
      if (req.admin?.role !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Only super admins can create users.' });
      }

      const { username, password, full_name, email, phone, role } = req.body;
      if (!username || !password || !full_name) {
        return res.status(400).json({ success: false, message: 'Username, password, and full name are required.' });
      }

      const admin = await AdminModel.create({ username, password, full_name, email, phone, role });
      res.status(201).json({ success: true, message: 'Employee created successfully.', data: admin });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'Username or email already exists.' });
      }
      next(error);
    }
  },

  /**
   * GET /api/auth/me
   */
  async me(req, res) {
    res.json({ success: true, data: req.admin });
  },

  /**
   * POST /api/auth/change-password
   * Change own password (requires current password)
   */
  async changePassword(req, res, next) {
    try {
      const { current_password, new_password } = req.body;
      if (!current_password || !new_password) {
        return res.status(400).json({ success: false, message: 'Current and new password are required.' });
      }
      if (new_password.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      }

      await AdminModel.changePassword(req.admin.id, current_password, new_password);
      res.json({ success: true, message: 'Password changed successfully.' });
    } catch (error) {
      if (error.message === 'Current password is incorrect') {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // ——— Employee Management (super_admin only) ———

  /**
   * GET /api/auth/employees
   */
  async getEmployees(req, res, next) {
    try {
      if (req.admin?.role !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      const employees = await AdminModel.getAll();
      res.json({ success: true, data: employees });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/auth/employees/:id
   */
  async updateEmployee(req, res, next) {
    try {
      if (req.admin?.role !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      // Prevent self-demotion
      if (parseInt(req.params.id) === req.admin.id && req.body.role !== 'super_admin') {
        return res.status(400).json({ success: false, message: 'Cannot change your own role.' });
      }
      const employee = await AdminModel.update(req.params.id, req.body);
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found.' });
      }
      res.json({ success: true, message: 'Employee updated successfully.', data: employee });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/auth/employees/:id
   */
  async deleteEmployee(req, res, next) {
    try {
      if (req.admin?.role !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      if (parseInt(req.params.id) === req.admin.id) {
        return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
      }
      const deleted = await AdminModel.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Employee not found.' });
      }
      res.json({ success: true, message: 'Employee deleted successfully.' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/employees/:id/reset-password (super_admin only)
   */
  async resetEmployeePassword(req, res, next) {
    try {
      if (req.admin?.role !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      const { new_password } = req.body;
      if (!new_password || new_password.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      }
      await AdminModel.resetPassword(req.params.id, new_password);
      res.json({ success: true, message: 'Password reset successfully.' });
    } catch (error) {
      next(error);
    }
  },
};

export default AuthController;
