const Course = require('./course.model');
const { STATUS, ROLES } = require('../../core/constants');
const Branch = require('../branch/branch.model');
const { Op } = require('sequelize');

exports.createCourse = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can create course.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can create course.' });
    }

    const courseData = { ...req.body };

    const User = require('../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot create an Course.' });
    }
    courseData.added_by = req.user.reg_id; // Set added_by to current user
    if(!courseData.branch_id) {
      return res.status(400).json({ success: false, message: 'Branch ID is required.' });
    }
    const course = await Course.create(courseData);
    res.status(201).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

exports.getCourse = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can view course.' });
    // }
    const { branch_id } = req.body;

    if (!branch_id) {
      return res.status(400).json({ success: false, message: 'branch_id is required.' });
    }

    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view course.' });
    }

    // Check branch_id exists and is not deleted
    const branch = await Branch.findOne({ where: { branch_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] } });
    if (!branch) {
      return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });
    }
    
    const courses = await Course.findAll({ where: { status: { [Op.ne]: STATUS.DELETE }, branch_id:branch_id } });
    res.json({ success: true, data: courses });
  } catch (err) {
    next(err);
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can view course.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view course.' });
    }
    const course = await Course.findOne({ where: { course_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can update course.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can update course.' });
    }
    const course = await Course.findOne({ where: { course_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    await course.update(req.body);
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can delete course.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can delete course.' });
    }
    const course = await Course.findOne({ where: { course_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    await course.update({ status: '0' });
    res.json({ success: true, message: 'Course soft deleted (status=0)' });
  } catch (err) {
    next(err);
  }
};

exports.changeStatus = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can change course status.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can change course status.' });
    }
    const { status } = req.body;
    const course = await Course.findOne({ where: { course_id: req.params.id } });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    course.status = status;
    await course.save();
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
}; 