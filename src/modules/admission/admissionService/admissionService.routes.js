const express = require('express');
const router = express.Router();
const admissionServiceController = require('./admissionService.controller');
const admissionServiceValidator = require('./admissionService.validator');
const { validate } = require('../../../core/utils/validator');
const { authenticate } = require('../../../core/middleware/auth.middleware');

const multer = require('multer');
const upload = multer(); // handles multipart/form-data with only text fields

router.post('/',authenticate, upload.none(), admissionServiceValidator.createAdmissionService, validate, admissionServiceController.createAdmissionService);
// router.get('/',authenticate, upload.none(), admissionServiceValidator.fetchAdmissionService, validate, admissionServiceController.getAdmissionService);
// router.get('/:id',authenticate, admissionServiceController.getAdmissionServiceById);
router.put('/:id',authenticate, upload.none(), admissionServiceValidator.updateAdmissionService, validate, admissionServiceController.updateAdmissionService);
router.delete('/:id',authenticate, admissionServiceController.deleteAdmissionService);

module.exports = router; 