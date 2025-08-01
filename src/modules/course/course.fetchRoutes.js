const express = require('express');
const router = express.Router();
const courseController = require('./course.controller');
const courseValidator = require('./course.validator');
const { validate } = require('../../core/utils/validator');
const { authenticate } = require('../../core/middleware/auth.middleware');

const multer = require('multer');
const upload = multer(); // handles multipart/form-data with only text fields

router.post('/',authenticate, upload.none(), courseValidator.fetchCourse, validate, courseController.getCourse);
// router.get('/:id',authenticate, courseController.getCourseById);

module.exports = router; 