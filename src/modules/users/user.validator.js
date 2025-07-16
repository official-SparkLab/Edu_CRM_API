// modules/users/user.validator.js
// Validation rules for user endpoints

const { body } = require('express-validator');

const createUser = [
  body('user_name').notEmpty().withMessage('User name is required'),
  body('contact').notEmpty().isNumeric().withMessage('Contact is required and must be numeric'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirm_password').isLength({ min: 6 }).withMessage('Confirm password must be at least 6 characters'),
  body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),
  body('role').notEmpty().isNumeric().withMessage('Role is required and must be numeric'),
];

const updateUser = [
  body('user_name').optional().notEmpty().withMessage('User name is required'),
  body('contact').optional().notEmpty().isNumeric().withMessage('Contact is required and must be numeric'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirm_password').optional().isLength({ min: 6 }).withMessage('Confirm password must be at least 6 characters'),
  body('branch_id').optional().notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),
  body('role').optional().notEmpty().isNumeric().withMessage('Role is required and must be numeric'),
];

const deleteUser = [];

const fetchUserList = [
  body('branch_id').optional().notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),
];

const fetchUserById = [
  body('branch_id').optional().notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),
];

const updateStatus = [
  body('status').notEmpty().isNumeric().withMessage('Status is required and must be numeric'),
];

module.exports = { createUser, updateUser, deleteUser, fetchUserList, fetchUserById, updateStatus }; 