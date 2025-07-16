// modules/branch/branch.routes.js
// Branch management routes for CRM backend

const express = require('express');
const router = express.Router();
const branchController = require('./branch.controller');
const branchValidator = require('./branch.validator');
const { validate } = require('../../core/utils/validator');
const { authenticate } = require('../../core/middleware/auth.middleware');

router.post('/',authenticate, branchValidator.createBranch, validate, branchController.createBranch);
router.get('/',authenticate, branchController.fetchBranchList);
router.get('/:id',authenticate, branchController.fetchBranchById);
router.put('/:id',authenticate, branchValidator.updateBranch, validate, branchController.updateBranch);
router.delete('/:id',authenticate, branchController.deleteBranch);
router.put('/status/:id',authenticate, branchController.changeStatus);

module.exports = router; 