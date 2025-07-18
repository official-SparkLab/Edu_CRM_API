const Section = require('./section.model');
const { STATUS, ROLES } = require('../../core/constants');
const { Op } = require('sequelize');

exports.createSection = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can create section.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can create section.' });
    }

    const sectionData = { ...req.body };

    const User = require('../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot create an institute.' });
    }
    sectionData.added_by = req.user.reg_id; // Set added_by to current user

    const section = await Section.create(sectionData);
    res.status(201).json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

exports.getSections = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can view section.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view section.' });
    }
    const sections = await Section.findAll({ where: { status: { [Op.ne]: 2 } } });
    res.json({ success: true, data: sections });
  } catch (err) {
    next(err);
  }
};

exports.getSectionById = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can view section.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view section.' });
    }
    const section = await Section.findOne({ where: { section_id: req.params.id, status: { [Op.ne]: 2 } } });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    res.json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

exports.updateSection = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can update section.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can update section.' });
    }
    const section = await Section.findOne({ where: { section_id: req.params.id, status: { [Op.ne]: '2' } } });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    await section.update(req.body);
    res.json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

exports.deleteSection = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can delete section.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can delete section.' });
    }
    const section = await Section.findOne({ where: { section_id: req.params.id, status: { [Op.ne]: '2' } } });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    await section.update({ status: '2' });
    res.json({ success: true, message: 'Section soft deleted (status=2)' });
  } catch (err) {
    next(err);
  }
};

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
    res.json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
}; 