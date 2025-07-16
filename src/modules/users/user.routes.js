// modules/users/user.routes.js
// User management routes for CRM backend

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../core/middleware/auth.middleware');
const userController = require('./user.controller');
const userValidator = require('./user.validator');
const { validate } = require('../../core/utils/validator');

// Create User
router.post('/', authenticate, userValidator.createUser, validate, userController.createUser);
// Update User
router.put('/', authenticate, userValidator.updateUser, validate, userController.updateUser);
// Fetch User List
router.get('/', authenticate, userController.fetchUserList);
// Delete User
router.delete('/', authenticate, userValidator.deleteUser, validate, userController.deleteUser);
// Update Status
router.put('/status', authenticate, userValidator.updateStatus, validate, userController.updateStatus);

module.exports = router; 