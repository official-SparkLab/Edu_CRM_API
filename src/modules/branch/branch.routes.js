// modules/branch/branch.routes.js
// Branch management routes for CRM backend

const express = require('express');
const router = express.Router();
const branchController = require('./branch.controller');
const branchValidator = require('./branch.validator');
const { validate } = require('../../core/utils/validator');
const { authenticate } = require('../../core/middleware/auth.middleware');

const multer = require('multer');
const upload = multer(); // handles multipart/form-data with only text fields

router.post('/',authenticate, upload.none(), branchValidator.createBranch, validate, branchController.createBranch);
router.get('/',authenticate, branchController.fetchBranchList);
router.get('/:id',authenticate, branchController.fetchBranchById);
router.put('/:id',authenticate, branchValidator.updateBranch, validate, branchController.updateBranch);
router.delete('/:id',authenticate, branchController.deleteBranch);
router.put('/status/:id',authenticate, branchValidator.updateStatus, branchController.changeStatus);

module.exports = router; 