const { body } = require('express-validator');

const createSection = [
  body('title').notEmpty().withMessage('Academic Year Title is required'),
  // body('code').notEmpty().withMessage('Academic Year Code is required'),
  body('start_date').notEmpty().withMessage('Start Date is required'),
  body('end_date').notEmpty().withMessage('End Date is required'),
];

const updateSection = [
  body('title').optional().notEmpty().withMessage('Academic Year Title is required'),
  // body('code').optional().notEmpty().withMessage('Academic Year Code is required'),
  body('start_date').optional().notEmpty().withMessage('Start Date is required'),
  body('end_date').optional().notEmpty().withMessage('End Date is required'),
];

const updateStatus = [
  body('status').notEmpty().isNumeric().withMessage('Status is required and must be numeric'),
];

module.exports = { createSection, updateSection }; 