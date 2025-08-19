// modules/service/service.controller.js

const Service = require('./service.model');
const { STATUS } = require('../../core/constants');
const Branch = require('../branch/branch.model');
const { Op } = require('sequelize');
const cacheService = require('../../core/services/cache.service'); // cache service

// cache keys
const CACHE_PREFIX = 'service_';
const LIST_CACHE_PREFIX = 'service_list_';

function toPlain(instance) {
  if (!instance) return null;
  if (typeof instance.get === 'function') return instance.get({ plain: true });
  return instance;
}

// Create Service
exports.createService = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can create service.' });
    }

    const serviceData = { ...req.body };

    const User = require('../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) return res.status(404).json({ success: false, message: 'User not found.' });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot create a service.' });
    }

    if (!serviceData.branch_id) {
      return res.status(400).json({ success: false, message: 'Branch ID is required.' });
    }

    serviceData.added_by = req.user.reg_id;
    const service = await Service.create(serviceData);

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${service.branch_id}`);
    await cacheService.set(`${CACHE_PREFIX}${service.service_id}`, toPlain(service));

    res.status(201).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

// Get Services by branch (cached)
exports.getService = async (req, res, next) => {
  try {
    const { branch_id } = req.body;
    if (!branch_id) return res.status(400).json({ success: false, message: 'branch_id is required.' });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view service.' });
    }

    const branch = await Branch.findOne({ where: { branch_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] } });
    if (!branch) return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });

    const cacheKey = `${LIST_CACHE_PREFIX}${branch_id}`;
    let services = await cacheService.get(cacheKey);
    if (services) {
      return res.json({ success: true, data: services });
    }

    const rows = await Service.findAll({ where: { status: { [Op.ne]: STATUS.DELETE }, branch_id } });
    services = rows.map(r => toPlain(r));
    await cacheService.set(cacheKey, services);

    res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
};

// Get Service by ID (cached)
exports.getServiceById = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view service.' });
    }

    const cacheKey = `${CACHE_PREFIX}${req.params.id}`;
    let service = await cacheService.get(cacheKey);

    if (!service) {
      const row = await Service.findOne({ where: { service_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
      if (!row) return res.status(404).json({ success: false, message: 'Service not found' });
      service = toPlain(row);
      await cacheService.set(cacheKey, service);
    }

    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

// Update Service
exports.updateService = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can update service.' });
    }

    const serviceData = { ...req.body };
    const { branch_id } = req.body;

    const branch = await Branch.findOne({ where: { branch_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] } });
    if (!branch) return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });

    const User = require('../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) return res.status(404).json({ success: false, message: 'User not found.' });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot update a service.' });
    }

    serviceData.added_by = req.user.reg_id;
    const service = await Service.findOne({ where: { service_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    await service.update(serviceData);
    await service.reload();

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${service.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${service.service_id}`);
    await cacheService.set(`${CACHE_PREFIX}${service.service_id}`, toPlain(service));

    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

// Delete Service (soft)
exports.deleteService = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can delete service.' });
    }

    const service = await Service.findOne({ where: { service_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    await service.update({ status: STATUS.DELETE });

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${service.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${service.service_id}`);

    res.json({ success: true, message: 'Service soft deleted (status=0)' });
  } catch (err) {
    next(err);
  }
};

// Change Status
exports.changeStatus = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can change service status.' });
    }

    const { status } = req.body;
    const service = await Service.findOne({ where: { service_id: req.params.id } });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    service.status = status;
    await service.save();

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${service.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${service.service_id}`);
    await cacheService.set(`${CACHE_PREFIX}${service.service_id}`, toPlain(service));

    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};
