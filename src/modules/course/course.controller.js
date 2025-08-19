// modules/course/course.controller.js

const Course = require('./course.model');
const { STATUS } = require('../../core/constants');
const Branch = require('../branch/branch.model');
const { Op } = require('sequelize');
const cacheService = require('../../core/services/cache.service'); // added cache

// cache keys
const CACHE_PREFIX = 'course_';
const LIST_CACHE_PREFIX = 'course_list_';

function toPlain(instance) {
  if (!instance) return null;
  if (typeof instance.get === 'function') return instance.get({ plain: true });
  return instance;
}

// Create Course
exports.createCourse = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can create course.' });
    }

    const courseData = { ...req.body };
    if (!courseData.branch_id) {
      return res.status(400).json({ success: false, message: 'Branch ID is required.' });
    }

    const User = require('../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot create a course.' });
    }

    courseData.added_by = req.user.reg_id;
    const course = await Course.create(courseData);

    // invalidate list cache and set individual cache
    await cacheService.del(`${LIST_CACHE_PREFIX}${course.branch_id}`);
    await cacheService.set(`${CACHE_PREFIX}${course.course_id}`, toPlain(course));

    res.status(201).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// Get Courses by branch (cached)
exports.getCourse = async (req, res, next) => {
  try {
    const { branch_id } = req.body;
    if (!branch_id) {
      return res.status(400).json({ success: false, message: 'branch_id is required.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view course.' });
    }

    // check branch validity
    const branch = await Branch.findOne({ where: { branch_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] } });
    if (!branch) {
      return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });
    }

    // try cache
    const cacheKey = `${LIST_CACHE_PREFIX}${branch_id}`;
    let courses = await cacheService.get(cacheKey);
    if (courses) {
      return res.json({ success: true, data: courses });
    }

    const rows = await Course.findAll({ where: { status: { [Op.ne]: STATUS.DELETE }, branch_id } });
    courses = rows.map(r => toPlain(r));
    await cacheService.set(cacheKey, courses);

    res.json({ success: true, data: courses });
  } catch (err) {
    next(err);
  }
};

// Get Course by id (cached)
exports.getCourseById = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view course.' });
    }

    const cacheKey = `${CACHE_PREFIX}${req.params.id}`;
    let course = await cacheService.get(cacheKey);

    if (!course) {
      const courseRow = await Course.findOne({ where: { course_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
      if (!courseRow) return res.status(404).json({ success: false, message: 'Course not found' });
      course = toPlain(courseRow);
      await cacheService.set(cacheKey, course);
    }

    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// Update Course
exports.updateCourse = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can update course.' });
    }

    const course = await Course.findOne({ where: { course_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    await course.update(req.body);
    await course.reload();

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${course.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${course.course_id}`);
    await cacheService.set(`${CACHE_PREFIX}${course.course_id}`, toPlain(course));

    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// Delete Course (soft)
exports.deleteCourse = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can delete course.' });
    }

    const course = await Course.findOne({ where: { course_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    await course.update({ status: STATUS.DELETE });

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${course.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${course.course_id}`);

    res.json({ success: true, message: 'Course soft deleted (status=0)' });
  } catch (err) {
    next(err);
  }
};

// Change Status
exports.changeStatus = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can change course status.' });
    }

    const { status } = req.body;
    const course = await Course.findOne({ where: { course_id: req.params.id } });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    course.status = status;
    await course.save();

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${course.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${course.course_id}`);
    await cacheService.set(`${CACHE_PREFIX}${course.course_id}`, toPlain(course));

    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};
