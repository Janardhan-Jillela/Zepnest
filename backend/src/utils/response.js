/**
 * Sends a standardized success response.
 * @param {object} res - Express response object
 * @param {string} message - Success message
 * @param {*} data - Response payload
 * @param {number} statusCode - HTTP status code
 */
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Sends a standardized error response.
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {*} errors - Optional validation errors
 */
const sendError = (res, message, statusCode = 400, errors = null) => {
  const response = { success: false, message };
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
