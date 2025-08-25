const { body } = require('express-validator');

const createBatch = [
  body('batch_name').notEmpty().withMessage('Batch name is required'),
  body('batch_code').notEmpty().withMessage('Batch code is required'),
  body('course_id').notEmpty().isNumeric().withMessage('Course id is required'),
  body('batch_time').notEmpty().withMessage('Batch time is required'),
  body('branch_id').notEmpty().isNumeric().withMessage('Branch id is required'),
];

const updateBatch = [
  body('batch_name').notEmpty().withMessage('Batch name is required'),
  // body('batch_code').notEmpty().withMessage('Batch code is required'),
  // body('course_id').notEmpty().isNumeric().withMessage('Course id is required'),
  // body('batch_time').notEmpty().withMessage('Batch time is required'),
  body('branch_id').notEmpty().isNumeric().withMessage('Branch id is required'),
];

const fetchBatch = [
  body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),
];
const fetchBatchCourse = [
  body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),
  body('course_id').notEmpty().isNumeric().withMessage('Course ID is required and must be numeric'),
];

const updateStatus = [
  body('status').notEmpty().isNumeric().withMessage('Status is required and must be numeric'),
];

module.exports = { createBatch, updateBatch , fetchBatch, fetchBatchCourse, updateStatus }; 