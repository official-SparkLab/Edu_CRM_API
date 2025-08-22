const AdmissionCourse = require('./admissionCourse.model');
const { STATUS } = require('../../../core/constants');
const Branch = require('../../branch/branch.model');
const { Op } = require('sequelize');
const cacheService = require('../../../core/services/cache.service');

// cache keys
const CACHE_PREFIX = 'admissionCourse_';
const LIST_CACHE_PREFIX = 'admissionCourse_list_';

function toPlain(instance) {
  if (!instance) return null;
  if (typeof instance.get === 'function') return instance.get({ plain: true });
  return instance;
}

// ======================== CREATE ========================
exports.createAdmissionCourse = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res
        .status(403)
        .json({ success: false, message: 'Only Active User can create admissionCourse.' });
    }

    const admissionCourseData = { ...req.body };
    const User = require('../../users/user.model');

    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res
        .status(403)
        .json({ success: false, message: 'Inactive or deleted users cannot create an admissionCourse.' });
    }

    if (!admissionCourseData.branch_id) {
      return res.status(400).json({ success: false, message: 'Branch ID is required.' });
    }

    admissionCourseData.added_by = req.user.reg_id;

    const admissionCourse = await AdmissionCourse.create(admissionCourseData);

    // invalidate cache
    await cacheService.del(`${LIST_CACHE_PREFIX}${admissionCourse.branch_id}`);
    await cacheService.set(`${CACHE_PREFIX}${admissionCourse.adm_course_id}`, toPlain(admissionCourse));

    res.status(201).json({ success: true, data: admissionCourse });
  } catch (err) {
    next(err);
  }
};

// ======================== UPDATE ========================
exports.updateAdmissionCourse = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res
        .status(403)
        .json({ success: false, message: 'Only Active User can update admissionCourse.' });
    }

    const admissionCourseData = { ...req.body };
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
        .json({ success: false, message: 'Inactive or deleted users cannot update an admissionCourse.' });
    }

    admissionCourseData.added_by = req.user.reg_id;

    const admissionCourse = await AdmissionCourse.findOne({
      where: {
        adm_course_id: req.params.id,
        status: { [Op.notIn]: [STATUS.INACTIVE, STATUS.DELETE] }
      }
    });
    if (!admissionCourse) {
      return res.status(404).json({ success: false, message: 'AdmissionCourse not found' });
    }

    await admissionCourse.update(admissionCourseData);

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${admissionCourse.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${admissionCourse.adm_course_id}`);
    await cacheService.set(`${CACHE_PREFIX}${admissionCourse.adm_course_id}`, toPlain(admissionCourse));

    res.json({ success: true, data: admissionCourse });
  } catch (err) {
    next(err);
  }
};

// ======================== SOFT DELETE ========================
exports.deleteAdmissionCourse = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res
        .status(403)
        .json({ success: false, message: 'Only Active User can delete admissionCourse.' });
    }

    const admissionCourse = await AdmissionCourse.findOne({
      where: { adm_course_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } }
    });
    if (!admissionCourse) {
      return res.status(404).json({ success: false, message: 'AdmissionCourse not found' });
    }

    await admissionCourse.update({ status: STATUS.DELETE });

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${admissionCourse.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${admissionCourse.adm_course_id}`);

    res.json({ success: true, message: 'AdmissionCourse soft deleted (status=0)' });
  } catch (err) {
    next(err);
  }
};
