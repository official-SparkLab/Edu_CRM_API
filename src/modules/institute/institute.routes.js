const express = require('express');
const router = express.Router();
const instituteController = require('./institute.controller');
const instituteValidator = require('./institute.validator');
const { validate } = require('../../core/utils/validator');
const { authenticate } = require('../../core/middleware/auth.middleware');
const { createUploadConfig } = require('../../core/utils');

// ✅ Configure Multer to store files in uploads/institute/
// allow images + docs up to 10MB (default)
const upload = createUploadConfig('institute', { limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/',authenticate, upload.single('logo'), instituteValidator.createInstitute, validate, instituteController.createInstitute);
router.get('/',authenticate, instituteController.getInstitutes);
router.get('/:id',authenticate, instituteController.getInstituteById);
router.put('/:id',authenticate, upload.single('logo'), instituteValidator.updateInstitute, validate, instituteController.updateInstitute);
router.delete('/:id',authenticate, instituteController.deleteInstitute);
router.put('/status/:id',authenticate, instituteController.changeStatus);

module.exports = router; 