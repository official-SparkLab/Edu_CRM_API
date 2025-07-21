const { body } = require('express-validator');

const createEnquiry = [
  body('courses').notEmpty().withMessage('Courses name is required'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('contact').notEmpty().isNumeric().withMessage('Contact is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('college_name').notEmpty().withMessage('College name is required'),
  body('enquiry_date').notEmpty().withMessage('Enquiry date is required'),
  body('branch_id').notEmpty().isNumeric().withMessage('Branch id is required'),
];

const updateEnquiry = [
  // body('courses').notEmpty().withMessage('Courses name is required'),
  // body('full_name').notEmpty().withMessage('Full name is required'),
  // body('contact').notEmpty().isNumeric().withMessage('Contact is required'),
  // body('address').notEmpty().withMessage('Address is required'),
  // body('college_name').notEmpty().withMessage('College name is required'),
  // body('enquiry_date').notEmpty().withMessage('Enquiry date is required'),
  body('branch_id').notEmpty().isNumeric().withMessage('Branch id is required'),
];

const fetchEnquiry = [
  body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),
];

const updateStatus = [
  // body('enquiry_status').notEmpty().withMessage('Enquiry Status is required'),
];

module.exports = { createEnquiry, updateEnquiry , fetchEnquiry, updateStatus }; 