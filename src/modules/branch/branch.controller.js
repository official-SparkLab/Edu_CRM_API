// modules/branch/branch.controller.js
// Branch controller for CRM backend

const Branch = require('./branch.model');
const { STATUS, ROLES } = require('../../core/constants');
const { Op } = require('sequelize');
const branchService = require('./branch.service');

// Create Branch
exports.createBranch = async (req, res, next) => {
  try {
    const branch = await branchService.createBranch(req.body, req.user.reg_id);
    res.status(201).json({ success: true, data: branch });
  } catch (err) {
    if (err.message.startsWith('Unauthorized')) {
      return res.status(403).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// Update Branch
exports.updateBranch = async (req, res, next) => {
  try {
    const branch = await branchService.updateBranch(req.params.id, req.body, req.user.reg_id);
    res.json({ success: true, data: branch });
  } catch (err) {
    if (err.message.startsWith('Unauthorized') || err.message.startsWith('Cannot update')) {
      return res.status(403).json({ success: false, message: err.message });
    } else if (err.message.startsWith('Branch not found')) {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// Fetch Branch List
exports.fetchBranchList = async (req, res, next) => {
  try {
    const branches = await branchService.fetchBranchList(req.user.reg_id);
    res.json({ success: true, data: branches });
  } catch (err) {
    if (err.message.startsWith('Unauthorized')) {
      return res.status(403).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// Delete Branch
exports.deleteBranch = async (req, res, next) => {
  try {
    const result = await branchService.deleteBranch(req.body.branch_id || req.params.id, req.user.reg_id);
    res.json({ success: true, message: result.message });
  } catch (err) {
    if (err.message.startsWith('Unauthorized')) {
      return res.status(403).json({ success: false, message: err.message });
    } else if (err.message.startsWith('Branch not found')) {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// Update Status
exports.changeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const branch = await branchService.changeStatus(req.body.branch_id || req.params.id, status, req.user.reg_id);
    res.json({ success: true, data: branch });
  } catch (err) {
    if (err.message.startsWith('Unauthorized')) {
      return res.status(403).json({ success: false, message: err.message });
    }
    else if (err.message.startsWith('Branch not found')) {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
};

exports.fetchBranchById = async (req, res, next) => {
  try {
    const branch = await branchService.fetchBranchById(req.params.id, req.user.reg_id);
    res.json({ success: true, data: branch });
  } catch (err) {
    if (err.message.startsWith('Unauthorized')) {
      return res.status(403).json({ success: false, message: err.message });
    } else if (err.message.startsWith('Branch not found')) {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
};