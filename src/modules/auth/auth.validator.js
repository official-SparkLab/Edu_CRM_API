// modules/auth/auth.validator.js
// Validation rules for authentication endpoints

const { body } = require('express-validator');

const validateSuperAdmin = [
  body('user_name').notEmpty().withMessage('User name is required'),
  body('contact').notEmpty().isNumeric().withMessage('Contact is required and must be numeric'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { validateSuperAdmin, validateLogin }; 