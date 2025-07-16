// core/error-handler.js
// Centralized error handler middleware for CRM backend

module.exports = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || undefined
  });
}; 