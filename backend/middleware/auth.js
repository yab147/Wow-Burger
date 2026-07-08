import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'wow-burger-secret-key-change-in-production';

/**
 * Middleware to verify JWT token for protected routes
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided.' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token.' 
    });
  }
}

/**
 * Optional auth — sets req.admin if valid token provided, but doesn't block
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.admin = jwt.verify(token, JWT_SECRET);
    } catch {
      // ignore invalid tokens
    }
  }
  next();
}

/**
 * Role-based permission middleware
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions.' });
    }
    next();
  };
}

/**
 * Generate JWT token for admin user
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
