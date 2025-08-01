const express = require('express');
const router = express.Router();
const batchController = require('./batch.controller');
const batchValidator = require('./batch.validator');
const { validate } = require('../../core/utils/validator');
const { authenticate } = require('../../core/middleware/auth.middleware');

const multer = require('multer');
const upload = multer(); // handles multipart/form-data with only text fields

router.post('/',authenticate, upload.none(), batchValidator.fetchBatch, validate, batchController.getBatch);
// router.get('/:id',authenticate, batchController.getBatchById);

module.exports = router; 