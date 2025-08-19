// modules/institute/institute.controller.js

const Institute = require('./institute.model');
const { STATUS, ROLES } = require('../../core/constants');
const { Op } = require('sequelize');
const { getRelativePath } = require("../../core/utils");
const Branch = require('../branch/branch.model');
const User = require('../users/user.model');
const cacheService = require('../../core/services/cache.service'); // added cache

// cache keys
const CACHE_PREFIX = 'institute_';
const LIST_CACHE_KEY = 'institute_list';

function toPlain(instance) {
  if (!instance) return null;
  // instance may already be plain object
  if (typeof instance.get === 'function') return instance.get({ plain: true });
  return instance;
}

// Create Institute
exports.createInstitute = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can create an institute.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can create an institute.' });
    }

    const instituteData = { ...req.body };
    if (req.file) {
      instituteData.logo = getRelativePath("institute", req.file.filename);
    }

    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot create an institute.' });
    }

    instituteData.added_by = req.user.reg_id;
    const institute = await Institute.create(instituteData);

    // invalidate list cache and set individual cache
    await cacheService.del(LIST_CACHE_KEY);
    await cacheService.set(`${CACHE_PREFIX}${institute.institute_id}`, toPlain(institute));

    res.status(201).json({ success: true, data: institute });
  } catch (err) {
    next(err);
  }
};

// Get all Institutes (cached)
exports.getInstitutes = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can view institute.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can view institute.' });
    }

    let institutes = await cacheService.get(LIST_CACHE_KEY);
    if (institutes) {
      // cache hit (already plain objects)
      return res.json({ success: true, data: institutes });
    }

    const rows = await Institute.findAll({ where: { status: { [Op.ne]: STATUS.DELETE } } });
    institutes = rows.map(r => toPlain(r));
    await cacheService.set(LIST_CACHE_KEY, institutes);
    res.json({ success: true, data: institutes });
  } catch (err) {
    next(err);
  }
};

// Get institute by id (cached)
exports.getInstituteById = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can view institute.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can view institute.' });
    }

    const cacheKey = `${CACHE_PREFIX}${req.params.id}`;
    let institute = await cacheService.get(cacheKey);

    if (!institute) {
      const inst = await Institute.findOne({
        where: { institute_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } }
      });
      if (!inst) return res.status(404).json({ success: false, message: 'Institute not found' });
      institute = toPlain(inst);
      await cacheService.set(cacheKey, institute);
    }

    res.json({ success: true, data: institute });
  } catch (err) {
    next(err);
  }
};

// Update Institute
exports.updateInstitute = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can update institute.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can update institute.' });
    }

    const institute = await Institute.findOne({ where: { institute_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });

    const allowed = [
      'institute_name','registration_no','gst_no','email','phone_no','alternative_phone',
      'address','dist','state','pincode','established_year','director_name','status'
    ];
    const payload = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }
    if (req.file) {
      payload.logo = getRelativePath('institute', req.file.filename);
    }

    await institute.update(payload);
    await institute.reload();

    // invalidate caches
    await cacheService.del(LIST_CACHE_KEY);
    await cacheService.del(`${CACHE_PREFIX}${institute.institute_id}`);
    // update individual cache
    await cacheService.set(`${CACHE_PREFIX}${institute.institute_id}`, toPlain(institute));

    res.json({ success: true, data: institute });
  } catch (err) {
    next(err);
  }
};

// Delete Institute (soft)
exports.deleteInstitute = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can delete institute.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can delete institute.' });
    }

    const institute = await Institute.findOne({ where: { institute_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });

    await institute.update({ status: '0' });

    // invalidate caches
    await cacheService.del(LIST_CACHE_KEY);
    await cacheService.del(`${CACHE_PREFIX}${institute.institute_id}`);

    res.json({ success: true, message: 'Institute soft deleted (status=0)' });
  } catch (err) {
    next(err);
  }
};

// Change Status
exports.changeStatus = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can change institute status.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can change institute status.' });
    }

    const { status } = req.body;
    const institute = await Institute.findOne({ where: { institute_id: req.params.id } });
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });

    institute.status = status;
    await institute.save();

    // invalidate caches
    await cacheService.del(LIST_CACHE_KEY);
    await cacheService.del(`${CACHE_PREFIX}${institute.institute_id}`);
    await cacheService.set(`${CACHE_PREFIX}${institute.institute_id}`, toPlain(institute));

    res.json({ success: true, data: institute });
  } catch (err) {
    next(err);
  }
};

// Get institute + branch data for current user (cached where useful)
exports.getInstitutesBranchData = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view institute.' });
    }

    // Try to get first institute from list cache
    let institutes = await cacheService.get(LIST_CACHE_KEY);
    let institute;
    if (institutes && institutes.length) {
      institute = institutes[0];
    } else {
      // fallback to DB (only one expected in original code)
      const instRow = await Institute.findOne({ where: { status: { [Op.ne]: STATUS.DELETE } } });
      if (!instRow) return res.status(404).json({ success: false, message: 'Institute not found' });
      institute = toPlain(instRow);
      // set individual cache too
      await cacheService.set(`${CACHE_PREFIX}${institute.institute_id}`, institute);
    }

    const user = await User.findByPk(req.user.reg_id);
    const branch = await Branch.findOne({ where: { status: { [Op.ne]: STATUS.DELETE }, branch_id: user.branch_id } });

    const data = {
      logo: institute.logo,
      institute_name: institute.institute_name,
      branch_name: branch ? branch.branch_name : null,
    };
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
