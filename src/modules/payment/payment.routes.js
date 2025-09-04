const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const { authenticate } = require('../../core/middleware/auth.middleware');

const multer = require('multer');
const upload = multer(); // handle multipart/form-data with only text fields

// Fetch combined payment lists by branch (POST body: { branch_id })
router.post('/list', upload.none(), authenticate, paymentController.getPaymentsByBranch);

// Fetch combined payments by admission ID (POST body: { admission_id })
router.post('/admission', upload.none(), authenticate, paymentController.getPaymentsByAdmissionId);

// Fetch single payment by ID and type query param (?type=course|service)
router.get('/:id', authenticate, paymentController.getPaymentById);

// Soft delete payment by ID and type query param (?type=course|service)
router.delete('/:id', authenticate, paymentController.deletePaymentById);

module.exports = router;