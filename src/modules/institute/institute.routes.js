const express = require('express');
const router = express.Router();
const instituteController = require('./institute.controller');
const instituteValidator = require('./institute.validator');
const { validate } = require('../../core/utils/validator');
const { authenticate } = require('../../core/middleware/auth.middleware');

const multer = require('multer');
const path = require('path');

// ✅ Configure Multer to store files in /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/',authenticate, upload.single('logo'), instituteValidator.createInstitute, validate, instituteController.createInstitute);
router.get('/',authenticate, instituteController.getInstitutes);
router.get('/:id',authenticate, instituteController.getInstituteById);
router.put('/:id',authenticate, upload.single('logo'), instituteValidator.updateInstitute, validate, instituteController.updateInstitute);
router.delete('/:id',authenticate, instituteController.deleteInstitute);
router.put('/status/:id',authenticate, instituteController.changeStatus);

module.exports = router; 