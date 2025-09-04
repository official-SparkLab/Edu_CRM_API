const { body } = require('express-validator');

const createPayment = [
  body('type').notEmpty().isIn(['course', 'service']).withMessage('Payment type must be course or service'),
  body('payment_date').notEmpty().withMessage('Payment Date is required'),
  body('admission_id').notEmpty().isNumeric().withMessage('Admission ID is required and must be numeric'),
  body('amount_paid').notEmpty().isNumeric().withMessage('Paid Amount is required and must be numeric'),
  body('payment_mode').notEmpty().withMessage('Payment Mode is required'),
  body('received_by').notEmpty().withMessage('Received By is required'),
  body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),

  // For 'course' type, adm_course_id is required
  body('adm_course_id').if(body('type').equals('course')).notEmpty().isNumeric().withMessage('Admission Course ID is required for course payments'),

  // For 'service' type, adm_course_id should NOT be required (could add service specific fields here if any)
];

const updatePayment = [
  body('type').notEmpty().isIn(['course', 'service']).withMessage('Payment type must be course or service'),
  body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),
  body('admission_id').notEmpty().isNumeric().withMessage('Admission ID is required and must be numeric'),
  // Additional optional validations can be added as needed
];

const fetchPayment = [
  body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric')
];

const fetchPaymentByAdmissionId = [
  body('admission_id').notEmpty().isNumeric().withMessage('Admission ID is required and must be numeric')
];

module.exports = { createPayment, updatePayment, fetchPayment, fetchPaymentByAdmissionId };
