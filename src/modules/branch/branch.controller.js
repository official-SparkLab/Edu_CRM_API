const Branch = require('./branch.model');
const User = require('../users/user.model');
const { ROLES, STATUS } = require('../../core/constants');
const { Op } = require('sequelize');
const cacheService = require('../../core/services/cache.service');

const CACHE_PREFIX = 'branch_';
const LIST_CACHE_KEY = 'branch_list';

// Utility to check Super Admin active status
async function checkSuperAdmin(userId) {
  const user = await User.findByPk(userId);
  if (!user || user.status === STATUS.INACTIVE || user.status === STATUS.DELETE || user.role !== ROLES.SUPER_ADMIN) {
    throw new Error('Unauthorized: Only active Super-Admin users can perform this action.');
  }
  return user;
}

// Create Branch
exports.createBranch = async (req, res, next) => {
  try {
    await checkSuperAdmin(req.user.reg_id);

    const branch = await Branch.create({ ...req.body, added_by: req.user.reg_id, status: STATUS.ACTIVE });

    // Cache branch and invalidate list
    await cacheService.set(`${CACHE_PREFIX}${branch.branch_id}`, branch);
    await cacheService.del(LIST_CACHE_KEY);

    res.status(201).json({ success: true, data: branch });
  } catch (err) {
    if (err.message.startsWith('Unauthorized')) return res.status(403).json({ success: false, message: err.message });
    next(err);
  }
};

// Update Branch
exports.updateBranch = async (req, res, next) => {
  try {
    await checkSuperAdmin(req.user.reg_id);

    const branch = await Branch.findByPk(req.params.id);
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found.' });
    if (branch.status === STATUS.DELETE) return res.status(403).json({ success: false, message: 'Cannot update a deleted branch.' });

    await branch.update({ ...req.body, added_by: req.user.reg_id });

    // Cache branch and invalidate list
    await cacheService.set(`${CACHE_PREFIX}${branch.branch_id}`, branch);
    await cacheService.del(LIST_CACHE_KEY);

    res.json({ success: true, data: branch });
  } catch (err) {
    if (err.message.startsWith('Unauthorized')) return res.status(403).json({ success: false, message: err.message });
    next(err);
  }
};

// Fetch Branch List
exports.fetchBranchList = async (req, res, next) => {
  try {
    await checkSuperAdmin(req.user.reg_id);

    let branches = await cacheService.get(LIST_CACHE_KEY);
    if (!branches) {
      branches = await Branch.findAll({ where: { status: { [Op.ne]: STATUS.DELETE } } });
      await cacheService.set(LIST_CACHE_KEY, branches);
    }

    res.json({ success: true, data: branches });
  } catch (err) {
    if (err.message.startsWith('Unauthorized')) return res.status(403).json({ success: false, message: err.message });
    next(err);
  }
};

// Delete Branch (soft)
exports.deleteBranch = async (req, res, next) => {
  try {
    await checkSuperAdmin(req.user.reg_id);

    const branch = await Branch.findOne({ where: { branch_id: req.body.branch_id || req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found.' });

    await branch.update({ status: STATUS.DELETE });

    await cacheService.del(`${CACHE_PREFIX}${branch.branch_id}`);
    await cacheService.del(LIST_CACHE_KEY);

    res.json({ success: true, message: 'Branch soft deleted (status=2).' });
  } catch (err) {
    if (err.message.startsWith('Unauthorized')) return res.status(403).json({ success: false, message: err.message });
    next(err);
  }
};

// Change Status
exports.changeStatus = async (req, res, next) => {
  try {
    await checkSuperAdmin(req.user.reg_id);

    const branch = await Branch.findByPk(req.body.branch_id || req.params.id);
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found.' });

    branch.status = req.body.status;
    await branch.save();

    await cacheService.set(`${CACHE_PREFIX}${branch.branch_id}`, branch);
    await cacheService.del(LIST_CACHE_KEY);

    res.json({ success: true, data: branch });
  } catch (err) {
    if (err.message.startsWith('Unauthorized')) return res.status(403).json({ success: false, message: err.message });
    next(err);
  }
};

// Fetch Branch by ID
exports.fetchBranchById = async (req, res, next) => {
  try {
    await checkSuperAdmin(req.user.reg_id);

    const cacheKey = `${CACHE_PREFIX}${req.params.id}`;
    let branch = await cacheService.get(cacheKey);

    if (!branch) {
      branch = await Branch.findOne({ where: { branch_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
      if (!branch) return res.status(404).json({ success: false, message: 'Branch not found.' });
      await cacheService.set(cacheKey, branch);
    }

    res.json({ success: true, data: branch });
  } catch (err) {
    if (err.message.startsWith('Unauthorized')) return res.status(403).json({ success: false, message: err.message });
    next(err);
  }
};
