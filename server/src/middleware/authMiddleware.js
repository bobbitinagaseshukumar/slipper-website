const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const sessionService = require('../services/sessionService');
const { errorResponse } = require('../utils/responseHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_slipper_store_luxury_2026_secure';

/**
 * Authenticate JWT token & Validate Session with Strict 4-Day Inactivity Window
 */
const authenticateUser = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. Please log in.', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return errorResponse(res, 'Invalid or expired session. Please log in again.', 401);
    }

    // Strict Database Session Validation if sessionToken is present
    if (decoded.sessionToken) {
      const activeSession = await sessionService.validateAndTouchSession(decoded.sessionToken);
      if (!activeSession) {
        return errorResponse(
          res,
          'Your session has expired due to 4 days of inactivity or was logged out. Please log in again.',
          401
        );
      }
      req.session = activeSession;
      req.sessionToken = decoded.sessionToken;
    }

    // Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        profileImage: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse(res, 'User account no longer exists.', 401);
    }

    if (user.status === 'BLOCKED' || user.status === 'DELETED') {
      return errorResponse(res, 'Your account has been suspended. Please contact support.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Your session token has expired. Please log in again.', 401);
    }
    return errorResponse(res, 'Invalid authentication token.', 401);
  }
};

/**
 * Optional authentication: Attaches user if valid token exists, proceeds regardless
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.userId) {
        if (decoded.sessionToken) {
          const activeSession = await sessionService.validateAndTouchSession(decoded.sessionToken);
          if (activeSession) {
            req.session = activeSession;
            req.sessionToken = decoded.sessionToken;
          }
        }

        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, name: true, email: true, role: true, status: true },
        });
        if (user && user.status === 'ACTIVE') {
          req.user = user;
        }
      }
    }
    next();
  } catch (err) {
    // Silently continue for optional auth
    next();
  }
};

/**
 * Role-based authorization middleware
 */
const requireRole = (allowedRoles = ['ADMIN', 'SUPER_ADMIN']) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized access. Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Requires one of: ${allowedRoles.join(', ')}`,
        403
      );
    }

    next();
  };
};

module.exports = {
  authenticateUser,
  optionalAuth,
  requireRole,
};
