// modules/users/user.controller.js
// User controller for CRM backend

const bcrypt = require('bcryptjs');
const User = require('./user.model');
const Branch = require('../branch/branch.model');
const { ROLES, STATUS } = require('../../core/constants');
const { Op } = require('sequelize');

// Create User
exports.createUser = async (req, res, next) => {
  try {
    // Block if added_by (session user) is deleted
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser || addedByUser.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Deleted users cannot add new users.' });
    }
    if (!addedByUser || addedByUser.status === STATUS.INACTIVE) {
      return res.status(403).json({ success: false, message: 'Inactive users cannot add new users.' });
    }
    if (!addedByUser || addedByUser.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super-Admin add new users.' });
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
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser || addedByUser.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Deleted users cannot add new users.' });
    }
    if (!addedByUser || addedByUser.status === STATUS.INACTIVE) {
      return res.status(403).json({ success: false, message: 'Inactive users cannot add new users.' });
    }
    if (!addedByUser || addedByUser.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super-Admin add new users.' });
    }
    const { user_name, contact, email, password, confirm_password, branch_id, role } = req.body;
    const reg_id = req.params.id;
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
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser || addedByUser.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Deleted users cannot add new users.' });
    }
    if (!addedByUser || addedByUser.status === STATUS.INACTIVE) {
      return res.status(403).json({ success: false, message: 'Inactive users cannot add new users.' });
    }
    if (!addedByUser || addedByUser.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super-Admin add new users.' });
    }
    const branch_id = req.body.branch_id || req.user.branch_id;
    if (!branch_id) {
      return res.status(400).json({ success: false, message: 'branch_id is required.' });
    }
    const users = await User.findAll({ where: { branch_id, status: { [Op.ne]: 2 } },attributes: ['reg_id', 'user_name', 'contact', 'email', 'branch_id', 'role', 'status', 'added_by', 'created_at', 'updated_at'] });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// Delete User
exports.deleteUser = async (req, res, next) => {
  try {
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser || addedByUser.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Deleted users cannot add new users.' });
    }
    if (!addedByUser || addedByUser.status === STATUS.INACTIVE) {
      return res.status(403).json({ success: false, message: 'Inactive users cannot add new users.' });
    }
    if (!addedByUser || addedByUser.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super-Admin add new users.' });
    }
    const user = await User.findOne({ where: { reg_id: req.body.reg_id || req.params.id, status: { [Op.ne]: '2' } } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    await user.update({ status: '2' });
    res.json({ success: true, message: 'User soft deleted (status=2).' });
  } catch (err) {
    next(err);
  }
};

// Update Status
exports.changeStatus = async (req, res, next) => {
  try {
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser || addedByUser.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Deleted users cannot add new users.' });
    }
    if (!addedByUser || addedByUser.status === STATUS.INACTIVE) {
      return res.status(403).json({ success: false, message: 'Inactive users cannot add new users.' });
    }
    if (!addedByUser || addedByUser.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super-Admin add new users.' });
    }
    const { status } = req.body;
    const user = await User.findOne({ where: { reg_id: req.body.reg_id || req.params.id } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.status = status;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.fetchUserById = async (req, res, next) => {
  try {
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser || addedByUser.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Deleted users cannot add new users.' });
    }
    if (!addedByUser || addedByUser.status === STATUS.INACTIVE) {
      return res.status(403).json({ success: false, message: 'Inactive users cannot add new users.' });
    }
    if (!addedByUser || addedByUser.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super-Admin add new users.' });
    }
    const user = await User.findOne({ where: { reg_id: req.params.id, status: { [Op.ne]: 2 } },attributes: ['reg_id', 'user_name', 'contact', 'email', 'branch_id', 'role', 'status', 'added_by', 'created_at', 'updated_at'] });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}; 