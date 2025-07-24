// modules/auth/auth.routes.js
// Authentication routes for CRM backend

const express = require('express');
const router = express.Router();
const { login, createSuperAdmin } = require('./auth.controller');
const { validateSuperAdmin, validateLogin } = require('./auth.validator');
const { validate } = require('../../core/utils/validator');

const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // only 100 login attempts per window per IP
  message: 'Too many login attempts, please try again after 15 minutes'
});

const multer = require('multer');
const upload = multer(); // handles multipart/form-data with only text fields

// Super Admin creation (no auth required for first setup)
router.post('/super-admin', upload.none(), validateSuperAdmin, validate, createSuperAdmin);

// Login
router.post('/login', loginLimiter, upload.none(), validateLogin, validate, login); //loginLimiter applied only to login route

// Logout
router.post('/logout', (req, res) => {
  const cookieName = process.env.COOKIE_NAME || 'auth_token';
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAMESITE || 'lax',
  });
  res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router; 