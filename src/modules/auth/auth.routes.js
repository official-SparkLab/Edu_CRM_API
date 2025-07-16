// modules/auth/auth.routes.js
// Authentication routes for CRM backend

const express = require('express');
const router = express.Router();
const { login, createSuperAdmin } = require('./auth.controller');
const { validateSuperAdmin, validateLogin } = require('./auth.validator');
const { validate } = require('../../core/utils/validator');

// Super Admin creation (no auth required for first setup)
router.post('/super-admin', validateSuperAdmin, validate, createSuperAdmin);

// Login
router.post('/login', validateLogin, validate, login);

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