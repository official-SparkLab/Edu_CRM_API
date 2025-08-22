const { body, param } = require('express-validator');

// For fetching all admissions
const fetchAdmissions = [
  body('branch_id')
    .notEmpty().withMessage('Branch ID is required')
    .isNumeric().withMessage('Branch ID must be numeric'),
];

// For fetching admission by ID
const fetchAdmissionById = [
  param('id')
    .notEmpty().withMessage('Admission ID is required')
    .isNumeric().withMessage('Admission ID must be numeric'),
  body('branch_id')
    .notEmpty().withMessage('Branch ID is required')
    .isNumeric().withMessage('Branch ID must be numeric'),
];

// For soft delete admission
const deleteAdmission = [
  param('id')
    .notEmpty().withMessage('Admission ID is required')
    .isNumeric().withMessage('Admission ID must be numeric'),
  body('branch_id')
    .notEmpty().withMessage('Branch ID is required')
    .isNumeric().withMessage('Branch ID must be numeric'),
];

module.exports = { fetchAdmissions, fetchAdmissionById, deleteAdmission };
