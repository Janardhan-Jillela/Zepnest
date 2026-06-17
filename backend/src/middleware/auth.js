const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');
const User = require('../models/User');

/**
 * authenticate — JWT middleware
 *
 * Security practices:
 * - Validates Bearer token format
 * - Verifies signature, expiry, issuer, and audience
 * - Reloads user from DB (catches deactivated accounts mid-session)
 * - Attaches req.user for downstream handlers
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token || token.trim() === '') {
      return sendError(res, 'Access denied. Token is empty.', 401);
    }

    // 2. Verify token — checks signature, expiry, issuer, audience
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'zepnest-api',
        audience: 'zepnest-client',
      });
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return sendError(res, 'Session expired. Please log in again.', 401);
      }
      if (jwtErr.name === 'JsonWebTokenError') {
        return sendError(res, 'Invalid token. Please log in again.', 401);
      }
      if (jwtErr.name === 'NotBeforeError') {
        return sendError(res, 'Token not yet valid.', 401);
      }
      throw jwtErr;
    }

    // 3. Reload user from DB — catches deactivated accounts
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return sendError(res, 'User account no longer exists.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated.', 403);
    }

    // 4. Attach to request
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * requireRole — Role-based access control middleware
 * Usage: router.get('/admin', authenticate, requireRole('admin'), handler)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return sendError(
      res,
      `Access restricted. Required role: ${roles.join(' or ')}.`,
      403
    );
  }
  next();
};

module.exports = { authenticate, requireRole };
