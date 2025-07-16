const Institute = require('./institute.model');
const { Op } = require('sequelize');

exports.createInstitute = async (req, res, next) => {
  try {
    const institute = await Institute.create(req.body);
    res.status(201).json({ success: true, data: institute });
  } catch (err) {
    next(err);
  }
};

exports.getInstitutes = async (req, res, next) => {
  try {
    const institutes = await Institute.findAll({ where: { status: { [Op.ne]: 2 } } });
    res.json({ success: true, data: institutes });
  } catch (err) {
    next(err);
  }
};

exports.getInstituteById = async (req, res, next) => {
  try {
    const institute = await Institute.findOne({ where: { inst_id: req.params.id, status: { [Op.ne]: 2 } } });
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });
    res.json({ success: true, data: institute });
  } catch (err) {
    next(err);
  }
};

exports.updateInstitute = async (req, res, next) => {
  try {
    const institute = await Institute.findOne({ where: { inst_id: req.params.id, status: { [Op.ne]: '2' } } });
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });
    await institute.update(req.body);
    res.json({ success: true, data: institute });
  } catch (err) {
    next(err);
  }
};

exports.deleteInstitute = async (req, res, next) => {
  try {
    const institute = await Institute.findOne({ where: { inst_id: req.params.id, status: { [Op.ne]: '2' } } });
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });
    await institute.update({ status: '2' });
    res.json({ success: true, message: 'Institute soft deleted (status=2)' });
  } catch (err) {
    next(err);
  }
};

exports.changeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const institute = await Institute.findOne({ where: { inst_id: req.params.id } });
    if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });
    institute.status = status;
    await institute.save();
    res.json({ success: true, data: institute });
  } catch (err) {
    next(err);
  }
}; 