// modules/branch/branch.controller.js
// Branch controller for CRM backend

const Branch = require('./branch.model');
const { STATUS, ROLES } = require('../../core/constants');
const { Op } = require('sequelize');

// Create Branch
exports.createBranch = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can create branches.' });
    }
    if (req.user.status === STATUS.INACTIVE) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can create branches.' });
    }
    if (req.user.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can create branches..' });
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
    if (req.user.status === STATUS.INACTIVE) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can update branches.' });
    }
    if (req.user.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can update branches..' });
    }
    const { branch_name, branch_code, institute_name, email, phone, alternative_phone, address, district, state, pincode, established_date } = req.body;
    const branch_id = req.params.id;
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
    if (req.user.status === STATUS.ACTIVE) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can view branches.' });
    }
    if (req.user.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can view branches..' });
    }
    const branches = await Branch.findAll({ where: { status: { [Op.ne]: 2 } } });
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
    if (req.user.status === STATUS.INACTIVE) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can delete branches.' });
    }
    if (req.user.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can delete branches..' });
    }
    const branch = await Branch.findOne({ where: { branch_id: req.body.branch_id || req.params.id, status: { [Op.ne]: '2' } } });
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found.' });
    await branch.update({ status: '2' });
    res.json({ success: true, message: 'Branch soft deleted (status=2).' });
  } catch (err) {
    next(err);
  }
};

// Update Status
exports.changeStatus = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can update branch status.' });
    }
    if (req.user.status === STATUS.INACTIVE) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can update branch status.' });
    }
    if (req.user.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can update branch status..' });
    }
    const { status } = req.body;
    const branch = await Branch.findOne({ where: { branch_id: req.body.branch_id || req.params.id } });
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found.' });
    branch.status = status;
    await branch.save();
    res.json({ success: true, data: branch });
  } catch (err) {
    next(err);
  }
};

exports.fetchBranchById = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can view branches.' });
    }
    if (req.user.status === STATUS.INACTIVE) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can view branches.' });
    }
    if (req.user.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can view branches..' });
    }
    const branch = await Branch.findOne({ where: { branch_id: req.params.id, status: { [Op.ne]: 2 } } });
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found.' });
    res.json({ success: true, data: branch });
  } catch (err) {
    next(err);
  }
}; 