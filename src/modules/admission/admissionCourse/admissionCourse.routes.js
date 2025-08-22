const express = require('express');
const router = express.Router();
const admissionCourseController = require('./admissionCourse.controller');
const admissionCourseValidator = require('./admissionCourse.validator');
const { validate } = require('../../../core/utils/validator');
const { authenticate } = require('../../../core/middleware/auth.middleware');

const multer = require('multer');
const upload = multer(); // handles multipart/form-data with only text fields

router.post('/',authenticate, upload.none(), admissionCourseValidator.createAdmissionCourse, validate, admissionCourseController.createAdmissionCourse);
// router.get('/',authenticate, upload.none(), admissionCourseValidator.fetchAdmissionCourse, validate, admissionCourseController.getAdmissionCourse);
// router.get('/:id',authenticate, admissionCourseController.getAdmissionCourseById);
router.put('/:id',authenticate, upload.none(), admissionCourseValidator.updateAdmissionCourse, validate, admissionCourseController.updateAdmissionCourse);
router.delete('/:id',authenticate, admissionCourseController.deleteAdmissionCourse);

module.exports = router; 