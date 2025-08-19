// modules/auth/auth.validator.js
// Validation rules for authentication endpoints

const { body } = require("express-validator");

const validateMainBranch = [
  body('branch_name').notEmpty().withMessage('Branch name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('pincode').notEmpty().isNumeric().withMessage('Pincode is required and must be numeric'),
  body('established_date').notEmpty().withMessage('Established date is required'),
];

const validateSuperAdmin = [
  body("user_name").notEmpty().withMessage("User name is required"),
  body("contact")
    .notEmpty()
    .isNumeric()
    .withMessage("Contact is required and must be numeric"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body('branch_id').notEmpty().isNumeric().withMessage('Branch id is required and must be numeric'),
];

const validateLogin = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = { validateMainBranch, validateSuperAdmin, validateLogin };
