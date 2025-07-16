const express = require('express');
const router = express.Router();
const sectionController = require('./section.controller');
const sectionValidator = require('./section.validator');
const { validate } = require('../../core/utils/validator');
const { authenticate } = require('../../core/middleware/auth.middleware');

router.post('/',authenticate, sectionValidator.createSection, validate, sectionController.createSection);
router.get('/',authenticate, sectionController.getSections);
router.get('/:id',authenticate, sectionController.getSectionById);
router.put('/:id',authenticate, sectionValidator.updateSection, validate, sectionController.updateSection);
router.delete('/:id',authenticate, sectionController.deleteSection);
router.put('/status/:id',authenticate, sectionController.changeStatus);

module.exports = router; 