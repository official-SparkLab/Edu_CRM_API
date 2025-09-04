const PaymentService = require("./paymentService.model");
const { STATUS } = require("../../../core/constants");
const Branch = require("../../branch/branch.model");
const Admission = require("../../admission/admissionForm/admission.model");
const User = require("../../users/user.model");
const { Op } = require("sequelize");
const cacheService = require("../../../core/services/cache.service"); // cache service

// cache keys
const CACHE_PREFIX = "paymentService_";
const LIST_CACHE_PREFIX = "paymentService_list_";
const ADMISSION_CACHE_PREFIX = "paymentService_admission_";

function toPlain(instance) {
  if (!instance) return null;
  if (typeof instance.get === "function") return instance.get({ plain: true });
  return instance;
}

// ---------- Create PaymentService ----------
exports.createPaymentService = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only Active User can create payment.",
        });
    }

    const paymentServiceData = { ...req.body };
    const { branch_id, admission_id } = paymentServiceData;
    // Validate exactly one of adm_course_id or adm_service_id must be present

    if (!branch_id)
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required." });
    if (!admission_id)
      return res
        .status(400)
        .json({ success: false, message: "Admission ID is required." });

    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Inactive or deleted users cannot create a payment.",
        });
    }

    const branch = await Branch.findOne({
      where: { branch_id, status: { [Op.in]: [STATUS.ACTIVE] } },
    });
    if (!branch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or deleted branch_id." });

    const admission = await Admission.findOne({
      where: { admission_id, status: { [Op.in]: [STATUS.ACTIVE] } },
    });
    if (!admission)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or deleted admission_id." });

    paymentServiceData.added_by = req.user.reg_id;
    const paymentService = await PaymentService.create(paymentServiceData);

    // invalidate caches
    await Promise.all([
      cacheService.del(`${LIST_CACHE_PREFIX}${branch_id}`),
      cacheService.del(`${ADMISSION_CACHE_PREFIX}${admission_id}`),
      cacheService.set(
        `${CACHE_PREFIX}${paymentService.pay_service_id}`,
        toPlain(paymentService)
      ),
    ]);

    res.status(201).json({ success: true, data: paymentService });
  } catch (err) {
    next(err);
  }
};

// ---------- Get PaymentServices by Branch (cached) ----------
exports.getPaymentService = async (req, res, next) => {
  try {
    const { branch_id } = req.body;
    if (!branch_id)
      return res
        .status(400)
        .json({ success: false, message: "branch_id is required." });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only Active User can view payment.",
        });
    }

    const branch = await Branch.findOne({
      where: { branch_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] },
    });
    if (!branch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or deleted branch_id." });

    const cacheKey = `${LIST_CACHE_PREFIX}${branch_id}`;
    let paymentServices = await cacheService.get(cacheKey);
    if (paymentServices)
      return res.json({ success: true, data: paymentServices });

    const rows = await PaymentService.findAll({
      where: { status: { [Op.ne]: STATUS.DELETE }, branch_id },
    });
    paymentServices = rows.map((r) => toPlain(r));
    await cacheService.set(cacheKey, paymentServices);

    res.json({ success: true, data: paymentServices });
  } catch (err) {
    next(err);
  }
};

// ---------- Get PaymentService by ID (cached) ----------
exports.getPaymentServiceById = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only Active User can view payment.",
        });
    }

    const cacheKey = `${CACHE_PREFIX}${req.params.id}`;
    let paymentService = await cacheService.get(cacheKey);

    if (!paymentService) {
      const row = await PaymentService.findOne({
        where: {
          pay_service_id: req.params.id,
          status: { [Op.ne]: STATUS.DELETE },
        },
      });
      if (!row)
        return res
          .status(404)
          .json({ success: false, message: "Payment not found" });

      paymentService = toPlain(row);
      await cacheService.set(cacheKey, paymentService);
    }

    res.json({ success: true, data: paymentService });
  } catch (err) {
    next(err);
  }
};

// ---------- Update PaymentService ----------
exports.updatePaymentService = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only Active User can update payment.",
        });
    }

    const paymentServiceData = { ...req.body };
    const { branch_id, admission_id } = paymentServiceData;

    if (!branch_id)
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required." });
    if (!admission_id)
      return res
        .status(400)
        .json({ success: false, message: "Admission ID is required." });

    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Inactive or deleted users cannot update a payment.",
        });
    }

    const paymentService = await PaymentService.findOne({
      where: {
        pay_service_id: req.params.id,
        status: { [Op.ne]: STATUS.DELETE },
      },
    });
    if (!paymentService)
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });

    const branch = await Branch.findOne({
      where: { branch_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] },
    });
    if (!branch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or deleted branch_id." });

    const admission = await Admission.findOne({
      where: { admission_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] },
    });
    if (!admission)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or deleted admission_id." });

    paymentServiceData.added_by = req.user.reg_id;
    await paymentService.update(paymentServiceData);
    await paymentService.reload();

    await Promise.all([
      cacheService.del(`${LIST_CACHE_PREFIX}${paymentService.branch_id}`),
      cacheService.del(`${CACHE_PREFIX}${paymentService.pay_service_id}`),
      cacheService.del(
        `${ADMISSION_CACHE_PREFIX}${paymentService.admission_id}`
      ),
      cacheService.set(
        `${CACHE_PREFIX}${paymentService.pay_service_id}`,
        toPlain(paymentService)
      ),
    ]);

    res.json({ success: true, data: paymentService });
  } catch (err) {
    next(err);
  }
};

// ---------- Delete PaymentService (soft) ----------
exports.deletePaymentService = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only Active User can delete payment.",
        });
    }

    const paymentService = await PaymentService.findOne({
      where: {
        pay_service_id: req.params.id,
        status: { [Op.ne]: STATUS.DELETE },
      },
    });
    if (!paymentService)
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });

    await paymentService.update({ status: STATUS.DELETE });

    await Promise.all([
      cacheService.del(`${LIST_CACHE_PREFIX}${paymentService.branch_id}`),
      cacheService.del(`${CACHE_PREFIX}${paymentService.pay_service_id}`),
      cacheService.del(
        `${ADMISSION_CACHE_PREFIX}${paymentService.admission_id}`
      ),
    ]);

    res.json({ success: true, message: "Payment soft deleted successfully." });
  } catch (err) {
    next(err);
  }
};

// ---------- Change PaymentService Status ----------
exports.changeStatus = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only Active User can change payment status.",
        });
    }

    const { status } = req.body;
    const paymentService = await PaymentService.findOne({
      where: { pay_service_id: req.params.id },
    });
    if (!paymentService)
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });

    paymentService.status = status;
    await paymentService.save();

    await Promise.all([
      cacheService.del(`${LIST_CACHE_PREFIX}${paymentService.branch_id}`),
      cacheService.del(`${CACHE_PREFIX}${paymentService.pay_service_id}`),
      cacheService.del(
        `${ADMISSION_CACHE_PREFIX}${paymentService.admission_id}`
      ),
      cacheService.set(
        `${CACHE_PREFIX}${paymentService.pay_service_id}`,
        toPlain(paymentService)
      ),
    ]);

    res.json({ success: true, data: paymentService });
  } catch (err) {
    next(err);
  }
};

// ---------- Get PaymentServices by Admission ID (cached) ----------
exports.getPaymentServiceByAdmissionId = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only Active User can view payment.",
        });
    }

    const { admission_id } = req.body;
    if (!admission_id) {
      return res
        .status(400)
        .json({ success: false, message: "Admission ID is required." });
    }

    const cacheKey = `${ADMISSION_CACHE_PREFIX}${admission_id}`;
    let paymentServices = await cacheService.get(cacheKey);

    if (!paymentServices) {
      const rows = await PaymentService.findAll({
        where: { admission_id, status: { [Op.ne]: STATUS.DELETE } },
      });

      if (!rows.length) {
        return res
          .status(404)
          .json({
            success: false,
            message: "No payments found for this admission.",
          });
      }

      paymentServices = rows.map((r) => toPlain(r));
      await cacheService.set(cacheKey, paymentServices);
    }

    res.json({ success: true, data: paymentServices });
  } catch (err) {
    next(err);
  }
};
