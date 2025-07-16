// core/middleware/auth.middleware.js
// Middleware to authenticate JWT and set req.user

const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const cookieName = process.env.COOKIE_NAME || 'auth_token';
  const token = req.cookies[cookieName];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No authentication token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = { authenticate }; 