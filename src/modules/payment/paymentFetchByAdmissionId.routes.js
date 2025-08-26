const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const paymentValidator = require('./payment.validator');
const { validate } = require('../../core/utils/validator');
const { authenticate } = require('../../core/middleware/auth.middleware');

const multer = require('multer');
const upload = multer(); // handles multipart/form-data with only text fields

router.post('/',authenticate, upload.none(), paymentValidator.fetchPaymentByAdmissionId, validate, paymentController.getPaymentByAdmissionId);

module.exports = router; 