const express = require('express');
const router = express.Router();
const enquiryController = require('./enquiry.controller');
const enquiryValidator = require('./enquiry.validator');
const { validate } = require('../../core/utils/validator');
const { authenticate } = require('../../core/middleware/auth.middleware');

const multer = require('multer');
const upload = multer(); // handles multipart/form-data with only text fields

router.post('/',authenticate, upload.none(), enquiryValidator.fetchEnquiry, validate, enquiryController.getEnquiry);
// router.get('/:id',authenticate, enquiryController.getEnquiryById);

module.exports = router; 