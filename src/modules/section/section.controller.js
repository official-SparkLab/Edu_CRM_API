// modules/section/section.controller.js
const Section = require('./section.model');
const { STATUS, ROLES } = require('../../core/constants');
const { Op } = require('sequelize');
const cacheService = require('../../core/services/cache.service');

// Cache keys
const cachePrefix = 'section_';
const listCachePrefix = 'section_list';

// Create Section
exports.createSection = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can create section.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can create section.' });
    }

    const sectionData = { ...req.body, added_by: req.user.reg_id };
    const section = await Section.create(sectionData);

    // ✅ Invalidate section list cache
    await cacheService.del(listCachePrefix);

    res.status(201).json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

// Get All Sections
exports.getSections = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view sections.' });
    }

    // ✅ Check cache
    let sections = await cacheService.get(listCachePrefix);
    if (!sections) {
      sections = await Section.findAll({
        where: { status: { [Op.ne]: STATUS.DELETE } }
      });
      await cacheService.set(listCachePrefix, sections);
    }

    res.json({ success: true, data: sections });
  } catch (err) {
    next(err);
  }
};

// Get Section by ID
exports.getSectionById = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view section.' });
    }

    const cacheKey = `${cachePrefix}${req.params.id}`;
    let section = await cacheService.get(cacheKey);

    if (!section) {
      section = await Section.findOne({
        where: { section_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } }
      });
      if (section) {
        await cacheService.set(cacheKey, section);
      }
    }

    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    res.json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

// Update Section
exports.updateSection = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can update section.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can update section.' });
    }

    const section = await Section.findOne({
      where: { section_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } }
    });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    await section.update(req.body);

    // ✅ Invalidate caches
    await cacheService.del(`${cachePrefix}${section.section_id}`);
    await cacheService.del(listCachePrefix);

    res.json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

// Delete Section (soft delete)
exports.deleteSection = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can delete section.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can delete section.' });
    }

    const section = await Section.findOne({
      where: { section_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } }
    });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    await section.update({ status: '0' });

    // ✅ Invalidate caches
    await cacheService.del(`${cachePrefix}${section.section_id}`);
    await cacheService.del(listCachePrefix);

    res.json({ success: true, message: 'Section soft deleted (status=0)' });
  } catch (err) {
    next(err);
  }
};

// Change Status
exports.changeStatus = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can change section status.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can change section status.' });
    }

    const { status } = req.body;
    const section = await Section.findOne({ where: { section_id: req.params.id } });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    section.status = status;
    await section.save();

    // ✅ Invalidate caches
    await cacheService.del(`${cachePrefix}${section.section_id}`);
    await cacheService.del(listCachePrefix);

    res.json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};
