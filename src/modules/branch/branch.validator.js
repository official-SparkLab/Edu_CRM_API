// modules/branch/branch.validator.js
// Validation rules for branch endpoints

const { body } = require('express-validator');

const createBranch = [
  body('branch_name').notEmpty().withMessage('Branch name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('pincode').notEmpty().isNumeric().withMessage('Pincode is required and must be numeric'),
  body('established_date').notEmpty().withMessage('Established date is required'),
];

const updateBranch = [
  body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required'),
];

const deleteBranch = [
  body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required'),
];

const updateStatus = [
  body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required'),
  body('status').notEmpty().isNumeric().withMessage('Status is required and must be numeric'),
];

module.exports = { createBranch, updateBranch, deleteBranch, updateStatus }; 