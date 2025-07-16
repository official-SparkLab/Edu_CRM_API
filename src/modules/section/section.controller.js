const Section = require('./section.model');
const { Op } = require('sequelize');

exports.createSection = async (req, res, next) => {
  try {
    const section = await Section.create(req.body);
    res.status(201).json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

exports.getSections = async (req, res, next) => {
  try {
    const sections = await Section.findAll({ where: { status: { [Op.ne]: 2 } } });
    res.json({ success: true, data: sections });
  } catch (err) {
    next(err);
  }
};

exports.getSectionById = async (req, res, next) => {
  try {
    const section = await Section.findOne({ where: { section_id: req.params.id, status: { [Op.ne]: 2 } } });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    res.json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

exports.updateSection = async (req, res, next) => {
  try {
    const section = await Section.findOne({ where: { section_id: req.params.id, status: { [Op.ne]: '2' } } });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    await section.update(req.body);
    res.json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
};

exports.deleteSection = async (req, res, next) => {
  try {
    const section = await Section.findOne({ where: { section_id: req.params.id, status: { [Op.ne]: '2' } } });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    await section.update({ status: '2' });
    res.json({ success: true, message: 'Section soft deleted (status=2)' });
  } catch (err) {
    next(err);
  }
};

exports.changeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const section = await Section.findOne({ where: { section_id: req.params.id } });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    section.status = status;
    await section.save();
    res.json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
}; 