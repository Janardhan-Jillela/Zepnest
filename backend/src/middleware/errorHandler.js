const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.name}: ${err.message}`);
  console.error(err.stack);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    return sendError(res, messages.join(', '), 400);
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return sendError(res, `${field} already exists.`, 409);
  }

  // Sequelize FK constraint
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return sendError(res, 'Invalid reference. Related record not found.', 400);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 'File too large. Maximum size is 5MB.', 400);
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return sendError(res, 'Unexpected file field.', 400);
  }

  // Default
  const status = err.status || err.statusCode || 500;
  const message = status === 500 ? 'An internal server error occurred.' : err.message;
  return sendError(res, message, status);
};

const notFound = (req, res) => {
  return sendError(res, `Route ${req.method} ${req.originalUrl} not found.`, 404);
};

module.exports = { errorHandler, notFound };
