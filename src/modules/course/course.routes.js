const express = require('express');
const router = express.Router();
const courseController = require('./course.controller');
const courseValidator = require('./course.validator');
const { validate } = require('../../core/utils/validator');
const { authenticate } = require('../../core/middleware/auth.middleware');

router.post('/',authenticate, courseValidator.createCourse, validate, courseController.createCourse);
router.get('/',authenticate, courseValidator.fetchCourse, validate, courseController.getCourse);
router.get('/:id',authenticate, courseController.getCourseById);
router.put('/:id',authenticate, courseValidator.updateCourse, validate, courseController.updateCourse);
router.delete('/:id',authenticate, courseController.deleteCourse);
router.put('/status/:id',authenticate,courseValidator.updateStatus, validate, courseController.changeStatus);

module.exports = router; 