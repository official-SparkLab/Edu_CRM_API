// modules/users/user.routes.js
// User management routes for CRM backend

const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const userValidator = require('./user.validator');
const { validate } = require('../../core/utils/validator');
const { authenticate } = require('../../core/middleware/auth.middleware');

const multer = require('multer');
const upload = multer(); // handles multipart/form-data with only text fields

router.post('/',authenticate, upload.none(), userValidator.fetchUserList, validate, userController.fetchUserList);
// router.get('/:id',authenticate, userValidator.fetchUserById, validate, userController.fetchUserById);

module.exports = router; 