const { body } = require('express-validator');

const createInstitute = [
  body('inst_name').notEmpty().withMessage('Institute Name is required'),
  body('reg_no').notEmpty().withMessage('Registration Number is required'),
  body('gst_no').notEmpty().withMessage('GST Number is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone_no').notEmpty().isNumeric().withMessage('Phone Number is required and must be numeric'),
  body('address').notEmpty().withMessage('Address is required'),
  body('estd_year').notEmpty().withMessage('Established Date is required'),
  body('director').notEmpty().withMessage('Director Name is required'),
  body('status').optional().isString(),
  body('added_by').notEmpty().isNumeric().withMessage('Added By is required and must be numeric'),
];

const updateInstitute = [
  body('inst_name').optional().notEmpty().withMessage('Institute Name is required'),
  body('reg_no').optional().notEmpty().withMessage('Registration Number is required'),
  body('gst_no').optional().notEmpty().withMessage('GST Number is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone_no').optional().notEmpty().isNumeric().withMessage('Phone Number is required and must be numeric'),
  body('address').optional().notEmpty().withMessage('Address is required'),
  body('estd_year').optional().notEmpty().withMessage('Established Date is required'),
  body('director').optional().notEmpty().withMessage('Director Name is required'),
  body('status').optional().isString(),
  body('added_by').optional().isNumeric().withMessage('Added By must be numeric'),
];

const updateStatus = [
  body('status').notEmpty().isNumeric().withMessage('Status is required and must be numeric'),
];

module.exports = { createInstitute, updateInstitute }; 