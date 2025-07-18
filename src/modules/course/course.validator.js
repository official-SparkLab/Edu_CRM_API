const { body } = require('express-validator');

const createCourse = [
  body('course_name').notEmpty().withMessage('Course name is required'),
  body('duration').notEmpty().withMessage('Duration is required'),
  body('fees').notEmpty().isNumeric().withMessage('Fees is required'),
  body('certificate_offered').notEmpty().withMessage('Certificate Offered is required'),
  body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required'),
];

const updateCourse = [
  body('course_name').notEmpty().withMessage('Course name is required'),
  body('duration').notEmpty().withMessage('Duration is required'),
  body('fees').notEmpty().isNumeric().withMessage('Fees is required'),
  body('certificate_offered').notEmpty().withMessage('Certificate Offered is required'),
];

const fetchCourse = [
  body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),
];

const updateStatus = [
  body('status').notEmpty().isNumeric().withMessage('Status is required and must be numeric'),
];

module.exports = { createCourse, updateCourse , fetchCourse, updateStatus }; 