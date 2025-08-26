const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const paymentValidator = require('./payment.validator');
const { validate } = require('../../core/utils/validator');
const { authenticate } = require('../../core/middleware/auth.middleware');

const multer = require('multer');
const upload = multer(); // handles multipart/form-data with only text fields

router.post('/',authenticate, upload.none(), paymentValidator.createPayment, validate, paymentController.createPayment);
// router.get('/',authenticate, upload.none(), paymentValidator.fetchPayment, validate, paymentController.getPayment);
router.get('/:id',authenticate, paymentController.getPaymentById);
router.put('/:id',authenticate, paymentValidator.updatePayment, validate, paymentController.updatePayment);
router.delete('/:id',authenticate, paymentController.deletePayment);
// router.put('/status/:id',authenticate,paymentValidator.updateStatus, validate, PaymentController.changeStatus);

module.exports = router; 