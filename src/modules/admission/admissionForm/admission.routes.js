const express = require('express');
const router = express.Router();
const admissionController = require('./admission.controller');
const admissionValidator = require('./admission.validator');
const { validate } = require('../../../core/utils/validator');
const { authenticate } = require('../../../core/middleware/auth.middleware');

const multer = require('multer');
const upload = multer(); // handles multipart/form-data with only text fields

router.post('/',authenticate, upload.none(), admissionValidator.createAdmission, validate, admissionController.createAdmission);
// router.get('/',authenticate, upload.none(), admissionValidator.fetchAdmission, validate, admissionController.getAdmission);
// router.get('/:id',authenticate, admissionController.getAdmissionById);
router.put('/:id',authenticate, upload.none(), admissionValidator.updateAdmission, validate, admissionController.updateAdmission);
router.delete('/:id',authenticate, admissionController.deleteAdmission);

module.exports = router; 