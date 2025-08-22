const Admission = require('./admission.model');
const { STATUS } = require('../../../core/constants');
const Branch = require('../../branch/branch.model');
const { Op } = require('sequelize');
const cacheService = require('../../../core/services/cache.service');

// cache keys
const CACHE_PREFIX = 'admission_';
const LIST_CACHE_PREFIX = 'admission_list_';

function toPlain(instance) {
  if (!instance) return null;
  if (typeof instance.get === 'function') return instance.get({ plain: true });
  return instance;
}

// Create Admission
exports.createAdmission = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can create admission.' });
    }

    const admissionData = { ...req.body };
    const User = require('../../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) return res.status(404).json({ success: false, message: 'User not found.' });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot create an admission.' });
    }

    if (!admissionData.branch_id) return res.status(400).json({ success: false, message: 'Branch ID is required.' });
    admissionData.added_by = req.user.reg_id;

    const admission = await Admission.create(admissionData);

    // invalidate cache
    await cacheService.del(`${LIST_CACHE_PREFIX}${admission.branch_id}`);
    await cacheService.set(`${CACHE_PREFIX}${admission.admission_id}`, toPlain(admission));

    res.status(201).json({ success: true, data: admission });
  } catch (err) {
    next(err);
  }
};


// Update Admission
exports.updateAdmission = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can update admission.' });
    }

    const admissionData = { ...req.body };
    const { branch_id } = req.body;

    const branch = await Branch.findOne({ where: { branch_id, status: { [Op.in]: [STATUS.ACTIVE, STATUS.INACTIVE] } } });
    if (!branch) return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });

    const User = require('../../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) return res.status(404).json({ success: false, message: 'User not found.' });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot update an admission.' });
    }

    admissionData.added_by = req.user.reg_id;
    const admission = await Admission.findOne({ where: { admission_id: req.params.id, status: { [Op.notIn]: [STATUS.INACTIVE, STATUS.DELETE] } } });
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });

    await admission.update(admissionData);

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${admission.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${admission.admission_id}`);
    await cacheService.set(`${CACHE_PREFIX}${admission.admission_id}`, toPlain(admission));

    res.json({ success: true, data: admission });
  } catch (err) {
    next(err);
  }
};

// Soft Delete Admission
exports.deleteAdmission = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can delete admission.' });
    }

    const admission = await Admission.findOne({ where: { admission_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });

    await admission.update({ status: STATUS.DELETE });

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${admission.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${admission.admission_id}`);

    res.json({ success: true, message: 'Admission soft deleted (status=0)' });
  } catch (err) {
    next(err);
  }
};
