const PaymentCourse = require("./paymentCourse.model");
const { STATUS } = require("../../../core/constants");
const Branch = require("../../branch/branch.model");
const Admission = require("../../admission/admissionForm/admission.model");
const User = require("../../users/user.model");
const { Op } = require("sequelize");
const cacheService = require("../../../core/services/cache.service"); // cache service

// cache keys
const CACHE_PREFIX = "paymentCourse_";
const LIST_CACHE_PREFIX = "paymentCourse_list_";
const ADMISSION_CACHE_PREFIX = "paymentCourse_admission_";

function toPlain(instance) {
  if (!instance) return null;
  if (typeof instance.get === "function") return instance.get({ plain: true });
  return instance;
}

// ---------- Create PaymentCourse ----------
exports.createPaymentCourse = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only Active User can create payment.",
        });
    }

    const paymentCourseData = { ...req.body };
    const { branch_id, admission_id, adm_course_id} =
      paymentCourseData;
    // Validate exactly one of adm_course_id or adm_service_id must be present
    if (!adm_course_id) {
      return res.status(400).json({
        success: false,
        message: "Admission Course ID must be provided.",
      });
    }

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

    paymentCourseData.added_by = req.user.reg_id;
    const paymentCourse = await PaymentCourse.create(paymentCourseData);

    // invalidate caches
    await Promise.all([
      cacheService.del(`${LIST_CACHE_PREFIX}${branch_id}`),
      cacheService.del(`${ADMISSION_CACHE_PREFIX}${admission_id}`),
      cacheService.set(
        `${CACHE_PREFIX}${paymentCourse.pay_course_id}`,
        toPlain(paymentCourse)
      ),
    ]);

    res.status(201).json({ success: true, data: paymentCourse });
  } catch (err) {
    next(err);
  }
};

// ---------- Get PaymentCourses by Branch (cached) ----------
exports.getPaymentCourse = async (req, res, next) => {
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
    let paymentCourses = await cacheService.get(cacheKey);
    if (paymentCourses)
      return res.json({ success: true, data: paymentCourses });

    const rows = await PaymentCourse.findAll({
      where: { status: { [Op.ne]: STATUS.DELETE }, branch_id },
    });
    paymentCourses = rows.map((r) => toPlain(r));
    await cacheService.set(cacheKey, paymentCourses);

    res.json({ success: true, data: paymentCourses });
  } catch (err) {
    next(err);
  }
};

// ---------- Get PaymentCourse by ID (cached) ----------
exports.getPaymentCourseById = async (req, res, next) => {
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
    let paymentCourse = await cacheService.get(cacheKey);

    if (!paymentCourse) {
      const row = await PaymentCourse.findOne({
        where: {
          pay_course_id: req.params.id,
          status: { [Op.ne]: STATUS.DELETE },
        },
      });
      if (!row)
        return res
          .status(404)
          .json({ success: false, message: "Payment not found" });

      paymentCourse = toPlain(row);
      await cacheService.set(cacheKey, paymentCourse);
    }

    res.json({ success: true, data: paymentCourse });
  } catch (err) {
    next(err);
  }
};

// ---------- Update PaymentCourse ----------
exports.updatePaymentCourse = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only Active User can update payment.",
        });
    }

    const paymentCourseData = { ...req.body };
    const { branch_id, admission_id } = paymentCourseData;

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

    const paymentCourse = await PaymentCourse.findOne({
      where: {
        pay_course_id: req.params.id,
        status: { [Op.ne]: STATUS.DELETE },
      },
    });
    if (!paymentCourse)
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

    paymentCourseData.added_by = req.user.reg_id;
    await paymentCourse.update(paymentCourseData);
    await paymentCourse.reload();

    await Promise.all([
      cacheService.del(`${LIST_CACHE_PREFIX}${paymentCourse.branch_id}`),
      cacheService.del(`${CACHE_PREFIX}${paymentCourse.pay_course_id}`),
      cacheService.del(
        `${ADMISSION_CACHE_PREFIX}${paymentCourse.admission_id}`
      ),
      cacheService.set(
        `${CACHE_PREFIX}${paymentCourse.pay_course_id}`,
        toPlain(paymentCourse)
      ),
    ]);

    res.json({ success: true, data: paymentCourse });
  } catch (err) {
    next(err);
  }
};

// ---------- Delete PaymentCourse (soft) ----------
exports.deletePaymentCourse = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only Active User can delete payment.",
        });
    }

    const paymentCourse = await PaymentCourse.findOne({
      where: {
        pay_course_id: req.params.id,
        status: { [Op.ne]: STATUS.DELETE },
      },
    });
    if (!paymentCourse)
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });

    await paymentCourse.update({ status: STATUS.DELETE });

    await Promise.all([
      cacheService.del(`${LIST_CACHE_PREFIX}${paymentCourse.branch_id}`),
      cacheService.del(`${CACHE_PREFIX}${paymentCourse.pay_course_id}`),
      cacheService.del(
        `${ADMISSION_CACHE_PREFIX}${paymentCourse.admission_id}`
      ),
    ]);

    res.json({ success: true, message: "Payment soft deleted successfully." });
  } catch (err) {
    next(err);
  }
};

// ---------- Change PaymentCourse Status ----------
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
    const paymentCourse = await PaymentCourse.findOne({
      where: { pay_course_id: req.params.id },
    });
    if (!paymentCourse)
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });

    paymentCourse.status = status;
    await paymentCourse.save();

    await Promise.all([
      cacheService.del(`${LIST_CACHE_PREFIX}${paymentCourse.branch_id}`),
      cacheService.del(`${CACHE_PREFIX}${paymentCourse.pay_course_id}`),
      cacheService.del(
        `${ADMISSION_CACHE_PREFIX}${paymentCourse.admission_id}`
      ),
      cacheService.set(
        `${CACHE_PREFIX}${paymentCourse.pay_course_id}`,
        toPlain(paymentCourse)
      ),
    ]);

    res.json({ success: true, data: paymentCourse });
  } catch (err) {
    next(err);
  }
};

// ---------- Get PaymentCourses by Admission ID (cached) ----------
exports.getPaymentCourseByAdmissionId = async (req, res, next) => {
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
    let paymentCourses = await cacheService.get(cacheKey);

    if (!paymentCourses) {
      const rows = await PaymentCourse.findAll({
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

      paymentCourses = rows.map((r) => toPlain(r));
      await cacheService.set(cacheKey, paymentCourses);
    }

    res.json({ success: true, data: paymentCourses });
  } catch (err) {
    next(err);
  }
};
