const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-__v');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

/**
 * Restrict routes to specific roles
 * @param {...string} roles - Roles allowed to access
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

/** Super Admin: top-level; treat ADMIN as Super Admin for backward compatibility */
const isSuperAdmin = (user) => user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';

/**
 * Check admin permissions
 * @param {...string} permissions - Permissions required
 */
const checkPermission = (...permissions) => {
  return (req, res, next) => {
    const adminRoles = ['ADMIN', 'SUBADMIN', 'SUPER_ADMIN', 'SUPER_SUBADMIN'];
    if (!adminRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin or Subadmin access required',
      });
    }

    if (isSuperAdmin(req.user) || req.user.role === 'SUPER_SUBADMIN') {
      return next();
    }

    if (req.user.adminProfile && req.user.adminProfile.permissions.length > 0) {
      const hasPermission = permissions.some((permission) =>
        req.user.adminProfile.permissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }
    }

    next();
  };
};

/**
 * Optional auth: set req.user if valid token present, otherwise continue without user.
 */
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-__v');
    if (user && user.isActive) req.user = user;
  } catch (e) {}
  next();
};

module.exports = {
  protect,
  authorize,
  checkPermission,
  isSuperAdmin,
  optionalAuth,
};