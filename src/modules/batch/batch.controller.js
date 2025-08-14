const Batch = require('./batch.model');
const { STATUS, ROLES } = require('../../core/constants');
const Branch = require('../branch/branch.model');
const { Op } = require('sequelize');

exports.createBatch = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can create batch.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can create batch.' });
    }

    const batchData = { ...req.body };

    const User = require('../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot create an batch.' });
    }
    batchData.added_by = req.user.reg_id; // Set added_by to current user
    if(!batchData.branch_id) {
      return res.status(400).json({ success: false, message: 'Branch ID is required.' });
    }
    const batch = await Batch.create(batchData);
    res.status(201).json({ success: true, data: batch });
  } catch (err) {
    next(err);
  }
};

exports.getBatch = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can view batch.' });
    // }
    const { branch_id } = req.body;

    if (!branch_id) {
      return res.status(400).json({ success: false, message: 'branch_id is required.' });
    }

    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view batch.' });
    }

    // Check branch_id exists and is not deleted
    const branch = await Branch.findOne({ where: { branch_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] } });
    if (!branch) {
      return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });
    }
    
    const batches = await Batch.findAll({ where: { status: { [Op.ne]: STATUS.DELETE }, branch_id:branch_id } });
    res.json({ success: true, data: batches });
  } catch (err) {
    next(err);
  }
};

exports.getBatchById = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can view batch.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view batch.' });
    }
    const batch = await Batch.findOne({ where: { batch_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, data: batch });
  } catch (err) {
    next(err);
  }
};

exports.updateBatch = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can update batch.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can update batch.' });
    }
    const batchData = { ...req.body };
    const { branch_id } = req.body;
    const branch = await Branch.findOne({ where: { branch_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] } });
    if (!branch) {
      return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(branch_id.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted branch cannot update an batch.' });
    }

    const User = require('../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot update an batch.' });
    }
    batchData.added_by = req.user.reg_id; // Set added_by to current user

    const batch = await Batch.findOne({ where: { batch_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    await batch.update(batchData);
    res.json({ success: true, data: batch });
  } catch (err) {
    next(err);
  }
};

exports.deleteBatch = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can delete batcg.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can delete batcg.' });
    }
    const batch = await Batch.findOne({ where: { batch_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    await batch.update({ status: '0' });
    res.json({ success: true, message: 'Batch soft deleted (status=0)' });
  } catch (err) {
    next(err);
  }
};

exports.changeStatus = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can change batch status.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can change batch status.' });
    }
    const { status } = req.body;
    const batch = await Batch.findOne({ where: { batch_id: req.params.id } });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    batch.status = status;
    await batch.save();
    res.json({ success: true, data: batch });
  } catch (err) {
    next(err);
  }
}; 