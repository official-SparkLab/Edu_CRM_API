// modules/branch/branch.controller.js
// Branch controller for CRM backend

const Branch = require('./branch.model');
const { STATUS, ROLES } = require('../../core/constants');

// Create Branch
exports.createBranch = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can create branches.' });
    }
    // Block if added_by (session user) is deleted
    const User = require('../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser || addedByUser.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Deleted users cannot add new branches.' });
    }
    const { branch_name, branch_code, institute_name, email, phone, alternative_phone, address, district, state, pincode, established_date } = req.body;
    const branch = await Branch.create({
      branch_name,
      branch_code,
      institute_name,
      email,
      phone,
      alternative_phone,
      address,
      district,
      state,
      pincode,
      established_date,
      added_by: req.user.reg_id,
      status: STATUS.ACTIVE
    });
    res.status(201).json({ success: true, data: branch });
  } catch (err) {
    next(err);
  }
};

// Update Branch
exports.updateBranch = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can update branches.' });
    }
    const { branch_id, branch_name, branch_code, institute_name, email, phone, alternative_phone, address, district, state, pincode, established_date } = req.body;
    const branch = await Branch.findByPk(branch_id);
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found.' });
    if (branch.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Cannot update a deleted branch.' });
    }
    if (branch_name) branch.branch_name = branch_name;
    if (branch_code) branch.branch_code = branch_code;
    if (institute_name) branch.institute_name = institute_name;
    if (email) branch.email = email;
    if (phone) branch.phone = phone;
    if (alternative_phone) branch.alternative_phone = alternative_phone;
    if (address) branch.address = address;
    if (district) branch.district = district;
    if (state) branch.state = state;
    if (pincode) branch.pincode = pincode;
    if (established_date) branch.established_date = established_date;
    branch.added_by = req.user.reg_id;
    await branch.save();
    res.json({ success: true, data: branch });
  } catch (err) {
    next(err);
  }
};

// Fetch Branch List
exports.fetchBranchList = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can view branches.' });
    }
    const branches = await Branch.findAll({ where: { status: [STATUS.ACTIVE, STATUS.INACTIVE] } });
    res.json({ success: true, data: branches });
  } catch (err) {
    next(err);
  }
};

// Delete Branch
exports.deleteBranch = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can delete branches.' });
    }
    const { branch_id } = req.body;
    const branch = await Branch.findByPk(branch_id);
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found.' });
    branch.status = STATUS.DELETE;
    await branch.save();
    res.json({ success: true, message: 'Branch deleted (soft delete).' });
  } catch (err) {
    next(err);
  }
};

// Update Status
exports.updateStatus = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can update branch status.' });
    }
    const { branch_id, status } = req.body;
    const branch = await Branch.findByPk(branch_id);
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found.' });
    if (branch.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Cannot update status of a deleted branch.' });
    }
    branch.status = status;
    await branch.save();
    res.json({ success: true, data: branch });
  } catch (err) {
    next(err);
  }
}; 