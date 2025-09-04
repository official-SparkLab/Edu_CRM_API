const express = require('express');
const router = express.Router();
const paymentCourseController = require('./paymentCourse.controller');
const paymentCourseValidator = require('./paymentCourse.validator');
const { validate } = require('../../../core/utils/validator');
const { authenticate } = require('../../../core/middleware/auth.middleware');

const multer = require('multer');
const upload = multer(); // handles multipart/form-data with only text fields

router.post('/',authenticate, upload.none(), paymentCourseValidator.fetchPaymentCourse, validate, paymentCourseController.getPaymentCourse);

module.exports = router; 