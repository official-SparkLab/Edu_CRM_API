const { body } = require('express-validator');

const createPaymentCourse = [
body('adm_course_id').notEmpty().isNumeric().withMessage('Admission Course ID is required'),
body('section_id').notEmpty().isNumeric().withMessage('Section ID is required'),
body('payment_date').notEmpty().withMessage('Payment Date is required'),
body('admission_id').notEmpty().isNumeric().withMessage('Admission ID is required'),
body('amount_paid').notEmpty().isNumeric().withMessage('Paid Amount is required'),
body('payment_mode').notEmpty().withMessage('Payment Mode is required'),
body('received_by').notEmpty().withMessage('Received By is required'),
body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),

];

const updatePaymentCourse = [
// body('adm_course_id').notEmpty().isNumeric().withMessage('Admission Course ID is required'),
body('section_id').notEmpty().isNumeric().withMessage('Section ID is required'),
//   body('payment_date').notEmpty().withMessage('Payment Date is required'),
// body('admission_id').notEmpty().isNumeric().withMessage('Admission ID is required'),
// body('amount_paid').notEmpty().isNumeric().withMessage('Paid Amount is required'),
// body('payment_mode').notEmpty().withMessage('Payment Mode is required'),
// body('received_by').notEmpty().withMessage('Received By is required'),
body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),

];

const fetchPaymentCourse = [
  body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),
];

const fetchPaymentCourseByAdmissionId = [
  body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),
  body('admission_id').notEmpty().isNumeric().withMessage('Admission ID is required and must be numeric'),
];

// const updateStatus = [
//   body('status').notEmpty().isNumeric().withMessage('Status is required and must be numeric'),
// ];

module.exports = { createPaymentCourse, updatePaymentCourse , fetchPaymentCourse, fetchPaymentCourseByAdmissionId }; 