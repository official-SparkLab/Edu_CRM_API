const express = require('express');
const router = express.Router();
const enquiryController = require('./enquiry.controller');
const enquiryValidator = require('./enquiry.validator');
const { validate } = require('../../core/utils/validator');
const { authenticate } = require('../../core/middleware/auth.middleware');

const multer = require('multer');
const upload = multer(); // handles multipart/form-data with only text fields

router.post('/',authenticate, upload.none(), enquiryValidator.createEnquiry, validate, enquiryController.createEnquiry);
router.get('/',authenticate, upload.none(), enquiryValidator.fetchEnquiry, validate, enquiryController.getEnquiry);
router.get('/:id',authenticate, enquiryController.getEnquiryById);
router.put('/:id',authenticate, upload.none(), enquiryValidator.updateEnquiry, validate, enquiryController.updateEnquiry);
router.delete('/:id',authenticate, enquiryController.deleteEnquiry);
router.put('/enquiry_status/:id',authenticate, upload.none(), enquiryValidator.updateStatus, validate, enquiryController.changeStatus);

module.exports = router; 