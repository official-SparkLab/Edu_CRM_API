const { body } = require('express-validator');

const createService = [
  body('service_name').notEmpty().withMessage('Service name is required'),
  body('branch_id').notEmpty().isNumeric().withMessage('Branch id is required'),
];

const updateService = [
  // body('service_name').notEmpty().withMessage('Service name is required'),
  body('branch_id').notEmpty().isNumeric().withMessage('Branch id is required'),
];

const fetchService = [
  body('branch_id').notEmpty().isNumeric().withMessage('Branch ID is required and must be numeric'),
];

const updateStatus = [
  body('status').notEmpty().isNumeric().withMessage('Status is required and must be numeric'),
];

module.exports = { createService, updateService , fetchService, updateStatus }; 