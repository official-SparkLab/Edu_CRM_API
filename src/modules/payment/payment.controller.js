const PaymentCourse = require('../payment/paymentCourse/paymentCourse.model');
const PaymentService = require('../payment/paymentService/paymentService.model');
const { STATUS } = require('../../core/constants');
const { Op } = require('sequelize');
const cacheService = require('../../core/services/cache.service');

function toPlain(instance) {
  if (!instance) return null;
  if (typeof instance.get === 'function') return instance.get({ plain: true });
  return instance;
}

function getModelByType(type) {
  if (type === 'service') return PaymentService;
  return PaymentCourse; // default
}

// Cache Keys Prefixes
const CACHE_PREFIX_COURSE = 'paymentCourse_';
const CACHE_PREFIX_SERVICE = 'paymentService_';
const LIST_CACHE_PREFIX_COURSE = 'paymentCourse_list_';
const LIST_CACHE_PREFIX_SERVICE = 'paymentService_list_';
const ADMISSION_CACHE_PREFIX_COURSE = 'paymentCourse_admission_';
const ADMISSION_CACHE_PREFIX_SERVICE = 'paymentService_admission_';

function addType(payments, type) {
  return payments.map(payment => ({
    ...payment,
    payment_type: type
  }));
}

exports.getPaymentsByBranch = async (req, res, next) => {
  try {
    const { branch_id } = req.body;
    if (!branch_id) return res.status(400).json({ success: false, message: 'branch_id is required.' });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view payment.' });
    }

    const [cachedCourses, cachedServices] = await Promise.all([
      cacheService.get(LIST_CACHE_PREFIX_COURSE + branch_id),
      cacheService.get(LIST_CACHE_PREFIX_SERVICE + branch_id)
    ]);

    let courses, services;
    if (cachedCourses && cachedServices) {
      courses = cachedCourses;
      services = cachedServices;
    } else {
      [courses, services] = await Promise.all([
        PaymentCourse.findAll({ where: { status: { [Op.ne]: STATUS.DELETE }, branch_id } }),
        PaymentService.findAll({ where: { status: { [Op.ne]: STATUS.DELETE }, branch_id } }),
      ]);
      courses = courses.map(toPlain);
      services = services.map(toPlain);

      await Promise.all([
        cacheService.set(LIST_CACHE_PREFIX_COURSE + branch_id, courses).catch(() => { }),
        cacheService.set(LIST_CACHE_PREFIX_SERVICE + branch_id, services).catch(() => { })
      ]);
    }

    // Combine and add payment_type property
    const combinedPayments = addType(courses, 'course').concat(addType(services, 'service'));

    // Sort by updatedAt date
    combinedPayments.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));

    res.json({
      success: true,
      data: combinedPayments,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPaymentsByAdmissionId = async (req, res, next) => {
  try {
    const { admission_id } = req.body;
    if (!admission_id) return res.status(400).json({ success: false, message: 'Admission ID is required.' });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view payment.' });
    }

    const [cachedCourses, cachedServices] = await Promise.all([
      cacheService.get(ADMISSION_CACHE_PREFIX_COURSE + admission_id),
      cacheService.get(ADMISSION_CACHE_PREFIX_SERVICE + admission_id)
    ]);

    let courses, services;
    if (cachedCourses && cachedServices) {
      courses = cachedCourses;
      services = cachedServices;
    } else {
      [courses, services] = await Promise.all([
        PaymentCourse.findAll({ where: { admission_id, status: { [Op.ne]: STATUS.DELETE } } }),
        PaymentService.findAll({ where: { admission_id, status: { [Op.ne]: STATUS.DELETE } } }),
      ]);

      if (!courses.length && !services.length) {
        return res.status(404).json({ success: false, message: 'No payments found for this admission.' });
      }

      courses = courses.map(toPlain);
      services = services.map(toPlain);

      await Promise.all([
        cacheService.set(ADMISSION_CACHE_PREFIX_COURSE + admission_id, courses).catch(() => { }),
        cacheService.set(ADMISSION_CACHE_PREFIX_SERVICE + admission_id, services).catch(() => { })
      ]);
    }

    // Combine and add payment_type property
    const combinedPayments = addType(courses, 'course').concat(addType(services, 'service'));

    // Sort by updatedAt date
    combinedPayments.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));

    res.json({
      success: true,
      data: combinedPayments,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // 'course' or 'service'

    if (!type || !['course', 'service'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Payment type (course or service) query param is required.' });
    }

    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view payment.' });
    }

    const Model = getModelByType(type);
    const pkField = type === 'service' ? 'pay_service_id' : 'pay_course_id';
    const cacheKey = (type === 'service' ? CACHE_PREFIX_SERVICE : CACHE_PREFIX_COURSE) + id;

    let payment = await cacheService.get(cacheKey);

    if (!payment) {
      const dbPayment = await Model.findOne({ where: { [pkField]: id, status: { [Op.ne]: STATUS.DELETE } } });
      if (!dbPayment) return res.status(404).json({ success: false, message: 'Payment not found' });
      payment = toPlain(dbPayment);
      await cacheService.set(cacheKey, payment).catch(() => { });
    }

    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

exports.deletePaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    if (!type || !['course', 'service'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Payment type (course or service) query param is required.' });
    }

    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can delete payment.' });
    }

    const Model = getModelByType(type);
    const pkField = type === 'service' ? 'pay_service_id' : 'pay_course_id';

    const payment = await Model.findOne({ where: { [pkField]: id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    await payment.update({ status: STATUS.DELETE });

    // Clear related caches
    const branchId = payment.branch_id;
    const admissionId = payment.admission_id;
    const cacheKey = (type === 'service' ? CACHE_PREFIX_SERVICE : CACHE_PREFIX_COURSE) + id;
    const listCacheKey = type === 'service' ? LIST_CACHE_PREFIX_SERVICE + branchId : LIST_CACHE_PREFIX_COURSE + branchId;
    const admissionCacheKey = type === 'service' ? ADMISSION_CACHE_PREFIX_SERVICE + admissionId : ADMISSION_CACHE_PREFIX_COURSE + admissionId;

    await Promise.all([
      cacheService.del(cacheKey).catch(() => { }),
      cacheService.del(listCacheKey).catch(() => { }),
      cacheService.del(admissionCacheKey).catch(() => { }),
    ]);

    res.json({ success: true, message: 'Payment soft deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
