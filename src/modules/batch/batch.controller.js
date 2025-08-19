// modules/batch/batch.controller.js

const Batch = require('./batch.model');
const { STATUS } = require('../../core/constants');
const Branch = require('../branch/branch.model');
const { Op } = require('sequelize');
const cacheService = require('../../core/services/cache.service'); // cache service

// cache keys
const CACHE_PREFIX = 'batch_';
const LIST_CACHE_PREFIX = 'batch_list_';

function toPlain(instance) {
  if (!instance) return null;
  if (typeof instance.get === 'function') return instance.get({ plain: true });
  return instance;
}

// Create Batch
exports.createBatch = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can create batch.' });
    }

    const batchData = { ...req.body };

    const User = require('../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) return res.status(404).json({ success: false, message: 'User not found.' });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot create a batch.' });
    }

    if (!batchData.branch_id) {
      return res.status(400).json({ success: false, message: 'Branch ID is required.' });
    }

    batchData.added_by = req.user.reg_id;
    const batch = await Batch.create(batchData);

    // invalidate cache
    await cacheService.del(`${LIST_CACHE_PREFIX}${batch.branch_id}`);
    await cacheService.set(`${CACHE_PREFIX}${batch.batch_id}`, toPlain(batch));

    res.status(201).json({ success: true, data: batch });
  } catch (err) {
    next(err);
  }
};

// Get Batches by branch (cached)
exports.getBatch = async (req, res, next) => {
  try {
    const { branch_id } = req.body;
    if (!branch_id) return res.status(400).json({ success: false, message: 'branch_id is required.' });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view batch.' });
    }

    const branch = await Branch.findOne({ where: { branch_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] } });
    if (!branch) return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });

    const cacheKey = `${LIST_CACHE_PREFIX}${branch_id}`;
    let batches = await cacheService.get(cacheKey);
    if (batches) {
      return res.json({ success: true, data: batches });
    }

    const rows = await Batch.findAll({ where: { status: { [Op.ne]: STATUS.DELETE }, branch_id } });
    batches = rows.map(r => toPlain(r));
    await cacheService.set(cacheKey, batches);

    res.json({ success: true, data: batches });
  } catch (err) {
    next(err);
  }
};

// Get Batch by ID (cached)
exports.getBatchById = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view batch.' });
    }

    const cacheKey = `${CACHE_PREFIX}${req.params.id}`;
    let batch = await cacheService.get(cacheKey);

    if (!batch) {
      const row = await Batch.findOne({ where: { batch_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
      if (!row) return res.status(404).json({ success: false, message: 'Batch not found' });
      batch = toPlain(row);
      await cacheService.set(cacheKey, batch);
    }

    res.json({ success: true, data: batch });
  } catch (err) {
    next(err);
  }
};

// Update Batch
exports.updateBatch = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can update batch.' });
    }

    const batchData = { ...req.body };
    const { branch_id } = req.body;

    const branch = await Branch.findOne({ where: { branch_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] } });
    if (!branch) return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });

    const User = require('../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) return res.status(404).json({ success: false, message: 'User not found.' });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot update a batch.' });
    }

    batchData.added_by = req.user.reg_id;
    const batch = await Batch.findOne({ where: { batch_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    await batch.update(batchData);
    await batch.reload();

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${batch.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${batch.batch_id}`);
    await cacheService.set(`${CACHE_PREFIX}${batch.batch_id}`, toPlain(batch));

    res.json({ success: true, data: batch });
  } catch (err) {
    next(err);
  }
};

// Delete Batch (soft)
exports.deleteBatch = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can delete batch.' });
    }

    const batch = await Batch.findOne({ where: { batch_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    await batch.update({ status: STATUS.DELETE });

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${batch.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${batch.batch_id}`);

    res.json({ success: true, message: 'Batch soft deleted (status=0)' });
  } catch (err) {
    next(err);
  }
};

// Change Status
exports.changeStatus = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can change batch status.' });
    }

    const { status } = req.body;
    const batch = await Batch.findOne({ where: { batch_id: req.params.id } });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    batch.status = status;
    await batch.save();

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${batch.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${batch.batch_id}`);
    await cacheService.set(`${CACHE_PREFIX}${batch.batch_id}`, toPlain(batch));

    res.json({ success: true, data: batch });
  } catch (err) {
    next(err);
  }
};
