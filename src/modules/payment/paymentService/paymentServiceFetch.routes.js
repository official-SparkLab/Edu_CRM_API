const express = require('express');
const router = express.Router();
const paymentServiceController = require('./paymentService.controller');
const paymentServiceValidator = require('./paymentService.validator');
const { validate } = require('../../../core/utils/validator');
const { authenticate } = require('../../../core/middleware/auth.middleware');

const multer = require('multer');
const upload = multer(); // handles multipart/form-data with only text fields

router.post('/',authenticate, upload.none(), paymentServiceValidator.fetchPaymentService, validate, paymentServiceController.getPaymentService);

module.exports = router; 