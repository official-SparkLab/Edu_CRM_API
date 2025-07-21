const express = require('express');
const router = express.Router();
const serviceController = require('./service.controller');
const serviceValidator = require('./service.validator');
const { validate } = require('../../core/utils/validator');
const { authenticate } = require('../../core/middleware/auth.middleware');

const multer = require('multer');
const upload = multer(); // handles multipart/form-data with only text fields

router.post('/',authenticate, upload.none(), serviceValidator.createService, validate, serviceController.createService);
router.get('/',authenticate, upload.none(), serviceValidator.fetchService, validate, serviceController.getService);
router.get('/:id',authenticate, serviceController.getServiceById);
router.put('/:id',authenticate, serviceValidator.updateService, validate, serviceController.updateService);
router.delete('/:id',authenticate, serviceController.deleteService);
router.put('/status/:id',authenticate,serviceValidator.updateStatus, validate, serviceController.changeStatus);

module.exports = router; 