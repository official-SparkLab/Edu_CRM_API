const express = require('express');
const router = express.Router();
const serviceController = require('./service.controller');
const serviceValidator = require('./service.validator');
const { validate } = require('../../core/utils/validator');
const { authenticate } = require('../../core/middleware/auth.middleware');

const multer = require('multer');
const upload = multer(); // handles multipart/form-data with only text fields

router.post('/',authenticate, upload.none(), serviceValidator.fetchService, validate, serviceController.getService);
// router.get('/:id',authenticate, serviceController.getServiceById);

module.exports = router; 