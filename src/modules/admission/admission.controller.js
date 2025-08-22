const Admission = require('../admission/admissionForm/admission.model');
const Document = require('../admission/document/document.model');
const AdmissionCourse = require('../admission/admissionCourse/admissionCourse.model');
const AdmissionService = require('../admission/admissionService/admissionService.model');
const Branch = require('../branch/branch.model');
const User = require('../users/user.model');
const { STATUS } = require('../../core/constants');

// ============== Get All Admissions with Details ==================
exports.getAdmission = async (req, res, next) => {
  try {
    const admissions = await Admission.findAll({
      where: { status: STATUS.ACTIVE },
      include: [
        { model: Document, as: 'documents' },
        { model: AdmissionCourse, as: 'courses' },
        { model: AdmissionService, as: 'services' },
        // { model: Branch, as: 'branch' },
        // { model: User, as: 'addedBy', attributes: ['reg_id', 'user_name', 'email'] }
      ]
    });

    res.json({ success: true, data: admissions });
  } catch (err) {
    next(err);
  }
};

// ============== Get Single Admission by ID ==================
exports.getAdmissionById = async (req, res, next) => {
  try {
    const admission = await Admission.findOne({
      where: { admission_id: req.params.id, status: STATUS.ACTIVE },
      include: [
        { model: Document, as: 'documents' },
        { model: AdmissionCourse, as: 'courses' },
        { model: AdmissionService, as: 'services' },
        // { model: Branch, as: 'branch' },
        // { model: User, as: 'addedBy', attributes: ['reg_id', 'user_name', 'email'] }
      ]
    });

    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }

    res.json({ success: true, data: admission });
  } catch (err) {
    next(err);
  }
};


// ============== Soft Delete Admission ==================
exports.deleteAdmission = async (req, res, next) => {
  try {
    const admission = await Admission.findOne({
      where: { admission_id: req.params.id, status: STATUS.ACTIVE }
    });

    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }

    await admission.update({ status: STATUS.INACTIVE }); // or 0 if you want hardcoded

    res.json({ success: true, message: 'Admission soft deleted (status=0)' });
  } catch (err) {
    next(err);
  }
};