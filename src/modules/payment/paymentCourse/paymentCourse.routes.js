const express = require('express');
const router = express.Router();
const paymentCourseController = require('./paymentCourse.controller');
const paymentCourseValidator = require('./paymentCourse.validator');
const { validate } = require('../../../core/utils/validator');
const { authenticate } = require('../../../core/middleware/auth.middleware');

const multer = require('multer');
const upload = multer(); // handles multipart/form-data with only text fields

router.post('/',authenticate, upload.none(), paymentCourseValidator.createPaymentCourse, validate, paymentCourseController.createPaymentCourse);
router.get('/:id',authenticate, paymentCourseController.getPaymentCourseById);
router.put('/:id',authenticate, paymentCourseValidator.updatePaymentCourse, validate, paymentCourseController.updatePaymentCourse);
router.delete('/:id',authenticate, paymentCourseController.deletePaymentCourse);
// router.put('/status/:id',authenticate,paymentCourseValidator.updateStatus, validate, PaymentCourseController.changeStatus);

module.exports = router; 