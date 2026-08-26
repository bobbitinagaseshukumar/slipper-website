const { errorResponse } = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
  console.error('❌ Server Error:', err.message || err);

  // Prisma Unique Constraint Violation (P2002)
  if (err.code === 'P2002') {
    const target = err.meta?.target ? err.meta.target.join(', ') : 'field';
    return errorResponse(res, `An account with this ${target} already exists.`, 409);
  }

  // Prisma Record Not Found (P2025)
  if (err.code === 'P2025') {
    return errorResponse(res, 'The requested resource was not found.', 404);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid security token.', 401);
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'An internal server error occurred. Please try again later.'
    : err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode);
};

const notFoundHandler = (req, res) => {
  return errorResponse(res, `API route not found: ${req.originalUrl}`, 404);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
