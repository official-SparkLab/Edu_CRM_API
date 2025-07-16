// modules/branch/branch.routes.js
// Branch management routes for CRM backend

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../core/middleware/auth.middleware');
const branchController = require('./branch.controller');
const branchValidator = require('./branch.validator');
const { validate } = require('../../core/utils/validator');

// Create Branch
router.post('/', authenticate, branchValidator.createBranch, validate, branchController.createBranch);
// Update Branch
router.put('/', authenticate, branchValidator.updateBranch, validate, branchController.updateBranch);
// Fetch Branch List
router.get('/', authenticate, branchController.fetchBranchList);
// Delete Branch
router.delete('/', authenticate, branchValidator.deleteBranch, validate, branchController.deleteBranch);
// Update Status
router.put('/status', authenticate, branchValidator.updateStatus, validate, branchController.updateStatus);

module.exports = router; 