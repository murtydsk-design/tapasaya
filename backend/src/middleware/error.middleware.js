/**
 * Centralized error handling middleware.
 * Returns consistent JSON error response structure:
 * { "success": false, "message": "..." }
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  
  // Safe user-facing message
  let message = err.message || 'Internal Server Error';

  // Do not expose stack traces or DB connection strings in non-development modes
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'An unexpected server error occurred. Please try again later.';
  }

  // Log 5xx server errors internally for debugging
  if (statusCode >= 500) {
    console.error(`[SERVER ERROR] ${req.method} ${req.originalUrl}:`, err.stack || err.message || err);
  }

  res.status(statusCode).json({
    success: false,
    message
  });
}

module.exports = errorHandler;
