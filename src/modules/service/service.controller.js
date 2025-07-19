const Service = require('./service.model');
const { STATUS, ROLES } = require('../../core/constants');
const Branch = require('../branch/branch.model');
const { Op } = require('sequelize');

exports.createService = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can create service.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can create service.' });
    }

    const serviceData = { ...req.body };

    const User = require('../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot create an service.' });
    }
    serviceData.added_by = req.user.reg_id; // Set added_by to current user
    if(!serviceData.branch_id) {
      return res.status(400).json({ success: false, message: 'Branch ID is required.' });
    }
    const service = await Service.create(serviceData);
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

exports.getService = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can view service.' });
    // }
    const { branch_id } = req.body;

    if (!branch_id) {
      return res.status(400).json({ success: false, message: 'branch_id is required.' });
    }

    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view service.' });
    }

    // Check branch_id exists and is not deleted
    const branch = await Branch.findOne({ where: { branch_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] } });
    if (!branch) {
      return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });
    }
    
    const services = await Service.findAll({ where: { status: { [Op.ne]: 2 }, branch_id:branch_id } });
    res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
};

exports.getServiceById = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can view service.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view service.' });
    }
    const service = await Service.findOne({ where: { service_id: req.params.id, status: { [Op.ne]: 2 } } });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can update service.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can update service.' });
    }
    const serviceData = { ...req.body };
    const { branch_id } = req.body;
    const branch = await Branch.findOne({ where: { branch_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] } });
    if (!branch) {
      return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(branch_id.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted branch cannot update an service.' });
    }

    const User = require('../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot update an service.' });
    }
    serviceData.added_by = req.user.reg_id; // Set added_by to current user

    const service = await Service.findOne({ where: { service_id: req.params.id, status: { [Op.ne]: '2' } } });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    await service.update(serviceData);
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can delete batcg.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can delete batcg.' });
    }
    const service = await Service.findOne({ where: { service_id: req.params.id, status: { [Op.ne]: '2' } } });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    await service.update({ status: '2' });
    res.json({ success: true, message: 'Service soft deleted (status=2)' });
  } catch (err) {
    next(err);
  }
};

exports.changeStatus = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can change service status.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can change service status.' });
    }
    const { status } = req.body;
    const service = await Service.findOne({ where: { service_id: req.params.id } });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    service.status = status;
    await service.save();
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
}; 