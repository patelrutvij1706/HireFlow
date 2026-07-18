const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to authenticate and check role
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Please login.'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found.'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is inactive.'
        });
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to access this resource.'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }
  };
};

// Middleware specifically for candidates
const requireCandidate = requireRole(['candidate']);

// Middleware specifically for recruiters
const requireRecruiter = requireRole(['recruiter']);

module.exports = {
  requireRole,
  requireCandidate,
  requireRecruiter
};

