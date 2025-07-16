const express = require('express');
const router = express.Router();
const instituteController = require('./institute.controller');
const instituteValidator = require('./institute.validator');
const { validate } = require('../../core/utils/validator');
const { authenticate } = require('../../core/middleware/auth.middleware');

router.post('/',authenticate, instituteValidator.createInstitute, validate, instituteController.createInstitute);
router.get('/',authenticate, instituteController.getInstitutes);
router.get('/:id',authenticate, instituteController.getInstituteById);
router.put('/:id',authenticate, instituteValidator.updateInstitute, validate, instituteController.updateInstitute);
router.delete('/:id',authenticate, instituteController.deleteInstitute);
router.put('/status/:id',authenticate, instituteController.changeStatus);

module.exports = router; 