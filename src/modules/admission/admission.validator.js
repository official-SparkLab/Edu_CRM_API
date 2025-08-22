const { body } = require('express-validator');

// For fetching all admissions
const fetchAdmissions = [
  body('branch_id')
    .notEmpty().withMessage('Branch ID is required')
    .isNumeric().withMessage('Branch ID must be numeric'),
];

module.exports = { fetchAdmissions };
