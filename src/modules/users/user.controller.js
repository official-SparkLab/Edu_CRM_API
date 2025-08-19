// modules/users/user.controller.js
// User controller for CRM backend (with caching)

const bcrypt = require('bcryptjs');
const User = require('./user.model');
const Branch = require('../branch/branch.model');
const { ROLES, STATUS } = require('../../core/constants');
const { Op } = require('sequelize');
const cacheService = require('../../core/services/cache.service');   // ✅ cache

// Cache keys
const CACHE_PREFIX = 'user_';
const LIST_CACHE_PREFIX = 'user_list_';
// Optional TTL (seconds) — only pass this to cacheService.set if supported.
// const CACHE_TTL = 300;

function toPlain(instance) {
  if (!instance) return null;
  if (typeof instance.get === 'function') return instance.get({ plain: true });
  return instance;
}

// Create User
exports.createUser = async (req, res, next) => {
  try {
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser || addedByUser.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super-Admin add new users.' });
    }
    if (!addedByUser || addedByUser.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Deleted users cannot add new users.' });
    }
    if (!addedByUser || addedByUser.status === STATUS.INACTIVE) {
      return res.status(403).json({ success: false, message: 'Inactive users cannot add new users.' });
    }

    const { user_name, contact, email, password, confirm_password, branch_id, role } = req.body;
    if (password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Ensure branch exists and is not deleted
    const branch = await Branch.findOne({
      where: { branch_id, status: { [Op.in]: [STATUS.ACTIVE, STATUS.INACTIVE] } }
    });
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

    const plainUser = toPlain(user);

    // invalidate branch list cache for this branch and set individual user cache
    await cacheService.del(`${LIST_CACHE_PREFIX}${branch_id}`);
    await cacheService.set(`${CACHE_PREFIX}${plainUser.reg_id}`, plainUser /*, CACHE_TTL */);

    res.status(201).json({ success: true, data: plainUser });
  } catch (err) {
    next(err);
  }
};

// Update User
exports.updateUser = async (req, res, next) => {
  try {
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser || addedByUser.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super-Admin add new users.' });
    }
    if (!addedByUser || addedByUser.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Deleted users cannot add new users.' });
    }
    if (!addedByUser || addedByUser.status === STATUS.INACTIVE) {
      return res.status(403).json({ success: false, message: 'Inactive users cannot add new users.' });
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

    // keep track of old branch to invalidate its list cache if changed
    const oldBranchId = user.branch_id;

    if (password) user.password = await bcrypt.hash(password, 10);
    if (user_name !== undefined) user.user_name = user_name;
    if (contact !== undefined) user.contact = contact;
    if (email !== undefined) user.email = email;
    if (branch_id !== undefined) user.branch_id = branch_id;
    if (role !== undefined) user.role = role;
    user.added_by = req.user.reg_id;

    await user.save();

    const plainUser = toPlain(user);

    // Invalidate caches:
    // - individual user cache
    await cacheService.del(`${CACHE_PREFIX}${plainUser.reg_id}`);
    // - branch list cache for old branch (if exists)
    if (oldBranchId) await cacheService.del(`${LIST_CACHE_PREFIX}${oldBranchId}`);
    // - branch list cache for new branch (if changed or exists)
    if (plainUser.branch_id) await cacheService.del(`${LIST_CACHE_PREFIX}${plainUser.branch_id}`);

    // update individual cache
    await cacheService.set(`${CACHE_PREFIX}${plainUser.reg_id}`, plainUser /*, CACHE_TTL */);

    res.json({ success: true, data: plainUser });
  } catch (err) {
    next(err);
  }
};

// Fetch User List
exports.fetchUserList = async (req, res, next) => {
  try {
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser || addedByUser.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super-Admin add new users.' });
    }
    if (!addedByUser || addedByUser.status === STATUS.DELETE) {
      return res.status(403).json({ success: false, message: 'Deleted users cannot add new users.' });
    }
    if (!addedByUser || addedByUser.status === STATUS.INACTIVE) {
      return res.status(403).json({ success: false, message: 'Inactive users cannot add new users.' });
    }

    const branch_id = req.body.branch_id || req.user.branch_id;
    if (!branch_id) {
      return res.status(400).json({ success: false, message: 'branch_id is required.' });
    }

    const cacheKey = `${LIST_CACHE_PREFIX}${branch_id}`;
    let users = await cacheService.get(cacheKey);
    if (users) {
      // cache hit: already plain objects
      return res.json({ success: true, data: users });
    }

    const rows = await User.findAll({
      where: { branch_id, status: { [Op.ne]: STATUS.DELETE } },
      attributes: ['reg_id', 'user_name', 'contact', 'email', 'branch_id', 'role', 'status', 'added_by', 'created_at', 'updated_at']
    });

    users = rows.map(r => toPlain(r));
    await cacheService.set(cacheKey, users /*, CACHE_TTL */);

    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// Delete User (soft)
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

    const user = await User.findOne({ where: { reg_id: req.body.reg_id || req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const plainBefore = toPlain(user);
    await user.update({ status: '0' });

    // Invalidate caches
    if (plainBefore && plainBefore.reg_id) await cacheService.del(`${CACHE_PREFIX}${plainBefore.reg_id}`);
    if (plainBefore && plainBefore.branch_id) await cacheService.del(`${LIST_CACHE_PREFIX}${plainBefore.branch_id}`);

    res.json({ success: true, message: 'User soft deleted (status=0).' });
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

    const plainUser = toPlain(user);

    // Invalidate caches
    await cacheService.del(`${CACHE_PREFIX}${plainUser.reg_id}`);
    if (plainUser.branch_id) await cacheService.del(`${LIST_CACHE_PREFIX}${plainUser.branch_id}`);
    // update individual cache
    await cacheService.set(`${CACHE_PREFIX}${plainUser.reg_id}`, plainUser /*, CACHE_TTL */);

    res.json({ success: true, data: plainUser });
  } catch (err) {
    next(err);
  }
};

// Fetch User By ID
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

    const cacheKey = `${CACHE_PREFIX}${req.params.id}`;
    let user = await cacheService.get(cacheKey);

    if (!user) {
      const inst = await User.findOne({
        where: { reg_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } },
        attributes: ['reg_id', 'user_name', 'contact', 'email', 'branch_id', 'role', 'status', 'added_by', 'created_at', 'updated_at']
      });
      if (!inst) return res.status(404).json({ success: false, message: 'User not found.' });
      user = toPlain(inst);
      await cacheService.set(cacheKey, user /*, CACHE_TTL */);
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
