const Payment = require('./payment.model');
const { STATUS } = require('../../core/constants');
const Branch = require('../branch/branch.model');
const Admission = require('../admission/admissionForm/admission.model');
const User = require('../users/user.model');
const { Op } = require('sequelize');
const cacheService = require('../../core/services/cache.service'); // cache service

// cache keys
const CACHE_PREFIX = 'payment_';
const LIST_CACHE_PREFIX = 'payment_list_';
const ADMISSION_CACHE_PREFIX = 'payment_admission_';

function toPlain(instance) {
  if (!instance) return null;
  if (typeof instance.get === 'function') return instance.get({ plain: true });
  return instance;
}

// ---------- Create Payment ----------
exports.createPayment = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can create payment.' });
    }

    const paymentData = { ...req.body };
    const { branch_id, admission_id, adm_course_id, adm_service_id } = paymentData;
    // Validate exactly one of adm_course_id or adm_service_id must be present
if ((!adm_course_id && !adm_service_id) || (adm_course_id && adm_service_id)) {
  return res.status(400).json({ 
    success: false, 
    message: 'Either Admission Course ID or Admission Service ID must be provided, but not both.'
  });
}

    if (!branch_id) return res.status(400).json({ success: false, message: 'Branch ID is required.' });
    if (!admission_id) return res.status(400).json({ success: false, message: 'Admission ID is required.' });

    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) return res.status(404).json({ success: false, message: 'User not found.' });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot create a payment.' });
    }

    const branch = await Branch.findOne({ where: { branch_id, status: { [Op.in]: [STATUS.ACTIVE] } } });
    if (!branch) return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });

    const admission = await Admission.findOne({ where: { admission_id, status: { [Op.in]: [STATUS.ACTIVE] } } });
    if (!admission) return res.status(400).json({ success: false, message: 'Invalid or deleted admission_id.' });

    paymentData.added_by = req.user.reg_id;
    const payment = await Payment.create(paymentData);

    // invalidate caches
    await Promise.all([
      cacheService.del(`${LIST_CACHE_PREFIX}${branch_id}`),
      cacheService.del(`${ADMISSION_CACHE_PREFIX}${admission_id}`),
      cacheService.set(`${CACHE_PREFIX}${payment.payment_id}`, toPlain(payment))
    ]);

    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

// ---------- Get Payments by Branch (cached) ----------
exports.getPayment = async (req, res, next) => {
  try {
    const { branch_id } = req.body;
    if (!branch_id) return res.status(400).json({ success: false, message: 'branch_id is required.' });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view payment.' });
    }

    const branch = await Branch.findOne({ where: { branch_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] } });
    if (!branch) return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });

    const cacheKey = `${LIST_CACHE_PREFIX}${branch_id}`;
    let payments = await cacheService.get(cacheKey);
    if (payments) return res.json({ success: true, data: payments });

    const rows = await Payment.findAll({ where: { status: { [Op.ne]: STATUS.DELETE }, branch_id } });
    payments = rows.map(r => toPlain(r));
    await cacheService.set(cacheKey, payments);

    res.json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
};

// ---------- Get Payment by ID (cached) ----------
exports.getPaymentById = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view payment.' });
    }

    const cacheKey = `${CACHE_PREFIX}${req.params.id}`;
    let payment = await cacheService.get(cacheKey);

    if (!payment) {
      const row = await Payment.findOne({ where: { payment_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
      if (!row) return res.status(404).json({ success: false, message: 'Payment not found' });

      payment = toPlain(row);
      await cacheService.set(cacheKey, payment);
    }

    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

// ---------- Update Payment ----------
exports.updatePayment = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can update payment.' });
    }

    const paymentData = { ...req.body };
    const { branch_id, admission_id } = paymentData;

    if (!branch_id) return res.status(400).json({ success: false, message: 'Branch ID is required.' });
    if (!admission_id) return res.status(400).json({ success: false, message: 'Admission ID is required.' });

    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) return res.status(404).json({ success: false, message: 'User not found.' });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot update a payment.' });
    }

    const payment = await Payment.findOne({ where: { payment_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    const branch = await Branch.findOne({ where: { branch_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] } });
    if (!branch) return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });

    const admission = await Admission.findOne({ where: { admission_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] } });
    if (!admission) return res.status(400).json({ success: false, message: 'Invalid or deleted admission_id.' });

    paymentData.added_by = req.user.reg_id;
    await payment.update(paymentData);
    await payment.reload();

    await Promise.all([
      cacheService.del(`${LIST_CACHE_PREFIX}${payment.branch_id}`),
      cacheService.del(`${CACHE_PREFIX}${payment.payment_id}`),
      cacheService.del(`${ADMISSION_CACHE_PREFIX}${payment.admission_id}`),
      cacheService.set(`${CACHE_PREFIX}${payment.payment_id}`, toPlain(payment))
    ]);

    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

// ---------- Delete Payment (soft) ----------
exports.deletePayment = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can delete payment.' });
    }

    const payment = await Payment.findOne({ where: { payment_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    await payment.update({ status: STATUS.DELETE });

    await Promise.all([
      cacheService.del(`${LIST_CACHE_PREFIX}${payment.branch_id}`),
      cacheService.del(`${CACHE_PREFIX}${payment.payment_id}`),
      cacheService.del(`${ADMISSION_CACHE_PREFIX}${payment.admission_id}`)
    ]);

    res.json({ success: true, message: 'Payment soft deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// ---------- Change Payment Status ----------
exports.changeStatus = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can change payment status.' });
    }

    const { status } = req.body;
    const payment = await Payment.findOne({ where: { payment_id: req.params.id } });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    payment.status = status;
    await payment.save();

    await Promise.all([
      cacheService.del(`${LIST_CACHE_PREFIX}${payment.branch_id}`),
      cacheService.del(`${CACHE_PREFIX}${payment.payment_id}`),
      cacheService.del(`${ADMISSION_CACHE_PREFIX}${payment.admission_id}`),
      cacheService.set(`${CACHE_PREFIX}${payment.payment_id}`, toPlain(payment))
    ]);

    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

// ---------- Get Payments by Admission ID (cached) ----------
exports.getPaymentByAdmissionId = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view payment.' });
    }

    const { admission_id } = req.body;
    if (!admission_id) {
      return res.status(400).json({ success: false, message: 'Admission ID is required.' });
    }

    const cacheKey = `${ADMISSION_CACHE_PREFIX}${admission_id}`;
    let payments = await cacheService.get(cacheKey);

    if (!payments) {
      const rows = await Payment.findAll({
        where: { admission_id, status: { [Op.ne]: STATUS.DELETE } }
      });

      if (!rows.length) {
        return res.status(404).json({ success: false, message: 'No payments found for this admission.' });
      }

      payments = rows.map(r => toPlain(r));
      await cacheService.set(cacheKey, payments);
    }

    res.json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
};
