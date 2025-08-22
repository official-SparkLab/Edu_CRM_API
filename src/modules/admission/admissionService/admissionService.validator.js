const { body } = require('express-validator');

const createAdmissionService = [
  body('service_id').notEmpty().isNumeric().withMessage('Service id is required'),
  body('admission_id').notEmpty().isNumeric().withMessage('Admission id is required'),
  body('branch_id').notEmpty().isNumeric().withMessage('Branch id is required'),
];

const updateAdmissionService = [
  body('service_id').notEmpty().isNumeric().withMessage('Service id is required'),
  body('admission_id').notEmpty().isNumeric().withMessage('Admission id is required'),
  body('branch_id').notEmpty().isNumeric().withMessage('Branch id is required'),
];

// const fetchAdmissionService = [
//   body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),
// ];


module.exports = { createAdmissionService, updateAdmissionService }; 