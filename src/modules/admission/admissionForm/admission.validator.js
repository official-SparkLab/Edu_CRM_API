const { body } = require('express-validator');

const createAdmission = [
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('gender').notEmpty().withMessage('Gender is required'),
  body('dob').notEmpty().withMessage('Date of Birth is required'),
  body('contact').notEmpty().isNumeric().withMessage('Contact is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('pincode').notEmpty().isNumeric().withMessage('Pincode is required'),
  body('college_name').notEmpty().withMessage('College name is required'),
  body('department').notEmpty().withMessage('Department name is required'),
  body('admission_date').notEmpty().withMessage('Admission date is required'),
  body('branch_id').notEmpty().isNumeric().withMessage('Branch id is required'),
];

const updateAdmission = [
  // body('full_name').notEmpty().withMessage('Full name is required'),
  // body('gender').notEmpty().withMessage('Gender is required'),
  // body('dob').notEmpty().withMessage('Date of Birth is required'),
  // body('contact').notEmpty().isNumeric().withMessage('Contact is required'),
  // body('address').notEmpty().withMessage('Address is required'),
  // body('pincode').notEmpty().isNumeric().withMessage('Pincode is required'),
  // body('college_name').notEmpty().withMessage('College name is required'),
  // body('department').notEmpty().withMessage('Department name is required'),
  // body('admission_date').notEmpty().withMessage('Admission date is required'),
  body('branch_id').notEmpty().isNumeric().withMessage('Branch id is required'),
];

// const fetchAdmission = [
//   body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),
// ];


module.exports = { createAdmission, updateAdmission }; 