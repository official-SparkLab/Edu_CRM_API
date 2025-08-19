const express = require('express');
const router = express.Router();
const instituteController = require('./institute.controller');
const { authenticate } = require('../../core/middleware/auth.middleware');


router.get('/',authenticate, instituteController.getInstitutesBranchData);

module.exports = router; 