// modules/users/user.controller.js
// User controller for CRM backend

const bcrypt = require('bcryptjs');
const User = require('./user.model');
const Branch = require('../branch/branch.model');
const { ROLES, STATUS } = require('../../core/constants');

// Create User
exports.createUser = async (req, res, next) => {
  try {
    // Block if added_by (session user) is deleted
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser || addedByUser.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Deleted users cannot add new users.' });
    }
    const { user_name, contact, email, password, confirm_password, branch_id, role } = req.body;
    if (password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }
    // Check branch_id exists and is not deleted
    const branch = await Branch.findOne({ where: { branch_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] } });
    if (!branch) {
      return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      user_name,
      contact,
      email,
      password: hashedPassword,
      branch_id,
      role,
      status: STATUS.ACTIVE,
      added_by: req.user.reg_id
    });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// Update User
exports.updateUser = async (req, res, next) => {
  try {
    const { reg_id, user_name, contact, email, password, confirm_password, branch_id, role } = req.body;
    const user = await User.findByPk(reg_id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Cannot update a deleted user.' });
    }
    if (password && password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }
    if (password) user.password = await bcrypt.hash(password, 10);
    if (user_name) user.user_name = user_name;
    if (contact) user.contact = contact;
    if (email) user.email = email;
    if (branch_id) user.branch_id = branch_id;
    if (role) user.role = role;
    user.added_by = req.user.reg_id;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// Fetch User List
exports.fetchUserList = async (req, res, next) => {
  try {
    const branch_id = req.body.branch_id || req.user.branch_id;
    if (!branch_id) {
      return res.status(400).json({ success: false, message: 'branch_id is required.' });
    }
    const users = await User.findAll({ where: { branch_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] } });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// Delete User
exports.deleteUser = async (req, res, next) => {
  try {
    const { reg_id } = req.body;
    const user = await User.findByPk(reg_id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.status = STATUS.DELETE;
    await user.save();
    res.json({ success: true, message: 'User deleted (soft delete).' });
  } catch (err) {
    next(err);
  }
};

// Update Status
exports.updateStatus = async (req, res, next) => {
  try {
    const { reg_id, status } = req.body;
    const user = await User.findByPk(reg_id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Cannot update status of a deleted user.' });
    }
    user.status = status;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}; 