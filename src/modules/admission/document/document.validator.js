const { body } = require('express-validator');

const createDocument = [
  body('document_name').notEmpty().withMessage('Document name is required'),
  body('file')
  .custom((value, { req }) => {
    // Case 1: File upload exists (e.g., multer adds req.file)
    if (req.file) return true;

    // Case 2: String value provided in body
    if (typeof value === 'string' && value.trim() !== '') return true;

    // If neither, validation fails
    throw new Error('File is required (upload a file or provide a valid string)');
  }),
  body('admission_id').notEmpty().isNumeric().withMessage('Admission Id is required'),
  body('branch_id').notEmpty().isNumeric().withMessage('Branch id is required'),
];

const updateDocument = [
  body('document_name').notEmpty().withMessage('Document name is required'),
  body('file')
  .custom((value, { req }) => {
    // Case 1: File upload exists (e.g., multer adds req.file)
    if (req.file) return true;

    // Case 2: String value provided in body
    if (typeof value === 'string' && value.trim() !== '') return true;

    // If neither, validation fails
    throw new Error('File is required (upload a file or provide a valid string)');
  }),
  body('admission_id').notEmpty().isNumeric().withMessage('Admission Id is required'),
  body('branch_id').notEmpty().isNumeric().withMessage('Branch id is required'),
];

// const fetchDocument = [
//   body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),
// ];


module.exports = { createDocument, updateDocument }; 