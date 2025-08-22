const AdmissionService = require('./admissionService.model');
const { STATUS } = require('../../../core/constants');
const Branch = require('../../branch/branch.model');
const { Op } = require('sequelize');
const cacheService = require('../../../core/services/cache.service');

// cache keys
const CACHE_PREFIX = 'admissionService_';
const LIST_CACHE_PREFIX = 'admissionService_list_';

function toPlain(instance) {
  if (!instance) return null;
  if (typeof instance.get === 'function') return instance.get({ plain: true });
  return instance;
}

// ======================== CREATE ========================
exports.createAdmissionService = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res
        .status(403)
        .json({ success: false, message: 'Only Active User can create admissionService.' });
    }

    const admissionServiceData = { ...req.body };
    const User = require('../../users/user.model');

    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res
        .status(403)
        .json({ success: false, message: 'Inactive or deleted users cannot create an admissionService.' });
    }

    if (!admissionServiceData.branch_id) {
      return res.status(400).json({ success: false, message: 'Branch ID is required.' });
    }

    admissionServiceData.added_by = req.user.reg_id;

    const admissionService = await AdmissionService.create(admissionServiceData);

    // invalidate cache
    await cacheService.del(`${LIST_CACHE_PREFIX}${admissionService.branch_id}`);
    await cacheService.set(`${CACHE_PREFIX}${admissionService.adm_service_id}`, toPlain(admissionService));

    res.status(201).json({ success: true, data: admissionService });
  } catch (err) {
    next(err);
  }
};

// ======================== UPDATE ========================
exports.updateAdmissionService = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res
        .status(403)
        .json({ success: false, message: 'Only Active User can update admissionService.' });
    }

    const admissionServiceData = { ...req.body };
    const { branch_id } = req.body;

    const branch = await Branch.findOne({
      where: { branch_id, status: { [Op.in]: [STATUS.ACTIVE, STATUS.INACTIVE] } }
    });
    if (!branch) {
      return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });
    }

    const User = require('../../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res
        .status(403)
        .json({ success: false, message: 'Inactive or deleted users cannot update an admissionService.' });
    }

    admissionServiceData.added_by = req.user.reg_id;

    const admissionService = await AdmissionService.findOne({
      where: {
        adm_service_id: req.params.id,
        status: { [Op.notIn]: [STATUS.INACTIVE, STATUS.DELETE] }
      }
    });
    if (!admissionService) {
      return res.status(404).json({ success: false, message: 'AdmissionService not found' });
    }

    await admissionService.update(admissionServiceData);

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${admissionService.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${admissionService.adm_service_id}`);
    await cacheService.set(`${CACHE_PREFIX}${admissionService.adm_service_id}`, toPlain(admissionService));

    res.json({ success: true, data: admissionService });
  } catch (err) {
    next(err);
  }
};

// ======================== SOFT DELETE ========================
exports.deleteAdmissionService = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res
        .status(403)
        .json({ success: false, message: 'Only Active User can delete admissionService.' });
    }

    const admissionService = await AdmissionService.findOne({
      where: { adm_service_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } }
    });
    if (!admissionService) {
      return res.status(404).json({ success: false, message: 'AdmissionService not found' });
    }

    await admissionService.update({ status: STATUS.DELETE });

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${admissionService.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${admissionService.adm_service_id}`);

    res.json({ success: true, message: 'AdmissionService soft deleted successfully' });
  } catch (err) {
    next(err);
  }
};
