const express = require('express');
const router = express.Router();
const paymentServiceController = require('./paymentService.controller');
const paymentServiceValidator = require('./paymentService.validator');
const { validate } = require('../../../core/utils/validator');
const { authenticate } = require('../../../core/middleware/auth.middleware');

const multer = require('multer');
const upload = multer(); // handles multipart/form-data with only text fields

router.post('/',authenticate, upload.none(), paymentServiceValidator.createPaymentService, validate, paymentServiceController.createPaymentService);
router.get('/:id',authenticate, paymentServiceController.getPaymentServiceById);
router.put('/:id',authenticate, paymentServiceValidator.updatePaymentService, validate, paymentServiceController.updatePaymentService);
router.delete('/:id',authenticate, paymentServiceController.deletePaymentService);
// router.put('/status/:id',authenticate,paymentServiceValidator.updateStatus, validate, PaymentServiceController.changeStatus);

module.exports = router; 