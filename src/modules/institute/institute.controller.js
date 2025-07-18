const Institute = require('./institute.model');
const { STATUS, ROLES } = require('../../core/constants');
const { Op } = require('sequelize');

exports.createInstitute = async (req, res, next) => {
  try {
    // Ensure only Super Admin and active user can create
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can create an institute.' });
    }

    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can create an institute.' });
    }
    const instituteData = { ...req.body };

    if (req.file) {
      instituteData.logo = `uploads/${req.file.filename}`; // Relative path
    }

    const User = require('../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot create an institute.' });
    }
    instituteData.added_by = req.user.reg_id; // Set added_by to current user

    const institute = await Institute.create(instituteData);
    res.status(201).json({ success: true, data: institute });
  } catch (err) {
    next(err);
  }
};

exports.getInstitutes = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can view institute.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can view institute.' });
    }
    const institutes = await Institute.findAll({ where: { status: { [Op.ne]: 2 } } });
    res.json({ success: true, data: institutes });
  } catch (err) {
    next(err);
  }
};

exports.getInstituteById = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can view institute.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can view institute.' });
    }
    const institute = await Institute.findOne({ where: { institute_id: req.params.id, status: { [Op.ne]: 2 } } });
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });
    res.json({ success: true, data: institute });
  } catch (err) {
    next(err);
  }
};

exports.updateInstitute = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can update institute.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can update institute.' });
    }
    const institute = await Institute.findOne({ where: { institute_id: req.params.id, status: { [Op.ne]: '2' } } });
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });
    await institute.update(req.body);
    res.json({ success: true, data: institute });
  } catch (err) {
    next(err);
  }
};

exports.deleteInstitute = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Super Admin can delete institute.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active Super Admin can delete institute.' });
    }
    const institute = await Institute.findOne({ where: { institute_id: req.params.id, status: { [Op.ne]: '2' } } });
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });
    await institute.update({ status: '2' });
    res.json({ success: true, message: 'Institute soft deleted (status=2)' });
  } catch (err) {
    next(err);
  }
};

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
    res.json({ success: true, data: institute });
  } catch (err) {
    next(err);
  }
}; 