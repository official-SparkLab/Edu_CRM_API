const express = require('express');
const router = express.Router();
const admissionController = require('./admission.controller');
const { authenticate } = require('../../core/middleware/auth.middleware');
const { validate } = require('../../core/utils/validator'); // your custom validate middleware
const { fetchAdmissions, fetchAdmissionById, deleteAdmission } = require('./admission.validator');

const multer = require('multer');
const upload = multer(); // handles multipart/form-data with only text fields

// Get All Admissions with full details
router.post('/', authenticate, upload.none(), fetchAdmissions, validate, admissionController.getAdmission);

// Get Admission by ID with full details
router.get('/:id', authenticate, admissionController.getAdmissionById);

// Soft Delete Admission (status = 0)
router.delete('/:id', authenticate, admissionController.deleteAdmission);

module.exports = router;
