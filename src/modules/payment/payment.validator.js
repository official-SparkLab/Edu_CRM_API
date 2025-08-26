const { body } = require('express-validator');

const createPayment = [
  body('payment_date').notEmpty().withMessage('Payment Date is required'),
body('admission_id').notEmpty().isNumeric().withMessage('Admission ID is required'),
body('amount_paid').notEmpty().isNumeric().withMessage('Paid Amount is required'),
body('payment_mode').notEmpty().withMessage('Payment Mode is required'),
body('received_by').notEmpty().withMessage('Received By is required'),
body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),

];

const updatePayment = [
//   body('payment_date').notEmpty().withMessage('Payment Date is required'),
// body('admission_id').notEmpty().isNumeric().withMessage('Admission ID is required'),
// body('amount_paid').notEmpty().isNumeric().withMessage('Paid Amount is required'),
// body('payment_mode').notEmpty().withMessage('Payment Mode is required'),
// body('received_by').notEmpty().withMessage('Received By is required'),
body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),

];

const fetchPayment = [
  body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),
];

const fetchPaymentByAdmissionId = [
  body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),
  body('admission_id').notEmpty().isNumeric().withMessage('Admission ID is required and must be numeric'),
];

// const updateStatus = [
//   body('status').notEmpty().isNumeric().withMessage('Status is required and must be numeric'),
// ];

module.exports = { createPayment, updatePayment , fetchPayment, fetchPaymentByAdmissionId }; 