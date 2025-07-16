const { body } = require('express-validator');

const createInstitute = [
  body('institute_name').notEmpty().withMessage('Institute Name is required'),
  // body('registration_no').notEmpty().withMessage('Registration Number is required'),
  // body('gst_no').notEmpty().withMessage('GST Number is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone_no').notEmpty().isNumeric().withMessage('Phone Number is required and must be numeric'),
  body('address').notEmpty().withMessage('Address is required'),
  body('pincode').optional().notEmpty().isNumeric().withMessage('Pincode is required and must be numeric'),
  body('logo')
  .custom((value, { req }) => {
    // Case 1: File upload exists (e.g., multer adds req.file)
    if (req.file) return true;

    // Case 2: String value provided in body
    if (typeof value === 'string' && value.trim() !== '') return true;

    // If neither, validation fails
    throw new Error('Logo is required (upload a file or provide a valid string)');
  }),
  // body('established_year').notEmpty().withMessage('Established Date is required'),
  body('director_name').notEmpty().withMessage('Director Name is required'),
  body('status').optional().isString(),
];

const updateInstitute = [
  body('institute_name').optional().notEmpty().withMessage('Institute Name is required'),
  // body('registration_no').optional().notEmpty().withMessage('Registration Number is required'),
  // body('gst_no').optional().notEmpty().withMessage('GST Number is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone_no').optional().notEmpty().isNumeric().withMessage('Phone Number is required and must be numeric'),
  body('address').optional().notEmpty().withMessage('Address is required'),
  body('pincode').optional().notEmpty().isNumeric().withMessage('Pincode is required and must be numeric'),
  body('logo')
  .custom((value, { req }) => {
    // Case 1: File upload exists (e.g., multer adds req.file)
    if (req.file) return true;

    // Case 2: String value provided in body
    if (typeof value === 'string' && value.trim() !== '') return true;

    // If neither, validation fails
    throw new Error('Logo is required (upload a file or provide a valid string)');
  }),
  // body('established_year').optional().notEmpty().withMessage('Established Date is required'),
  body('director_name').optional().notEmpty().withMessage('Director Name is required'),
  body('status').optional().isString(),
];

const updateStatus = [
  body('status').notEmpty().isNumeric().withMessage('Status is required and must be numeric'),
];

module.exports = { createInstitute, updateInstitute }; 