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

router.post('/',authenticate, upload.none(), userValidator.createUser, validate, userController.createUser);
router.get('/',authenticate, userValidator.fetchUserList, validate, userController.fetchUserList);
router.get('/:id',authenticate, userValidator.fetchUserById, validate, userController.fetchUserById);
router.put('/:id',authenticate, userValidator.updateUser, validate, userController.updateUser);
router.delete('/:id',authenticate, userController.deleteUser);
router.put('/status/:id',authenticate, userController.changeStatus);

module.exports = router; 