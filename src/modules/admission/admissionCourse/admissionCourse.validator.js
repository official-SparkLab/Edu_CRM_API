const { body } = require('express-validator');

const createAdmissionCourse = [
  body('course_id').notEmpty().isNumeric().withMessage('Course id is required'),
  body('batch_id').notEmpty().isNumeric().withMessage('Batch id is required'),
  body('admission_id').notEmpty().isNumeric().withMessage('Admission id is required'),
  body('branch_id').notEmpty().isNumeric().withMessage('Branch id is required'),
];

const updateAdmissionCourse = [
  body('course_id').notEmpty().isNumeric().withMessage('Course id is required'),
  body('batch_id').notEmpty().isNumeric().withMessage('Batch id is required'),
  body('admission_id').notEmpty().isNumeric().withMessage('Admission id is required'),
  body('branch_id').notEmpty().isNumeric().withMessage('Branch id is required'),
];

// const fetchAdmissionCourse = [
//   body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),
// ];


module.exports = { createAdmissionCourse, updateAdmissionCourse }; 