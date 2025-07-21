const Enquiry = require('./enquiry.model');
const { STATUS, ROLES } = require('../../core/constants');
const Branch = require('../branch/branch.model');
const { Op } = require('sequelize');

exports.createEnquiry = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can create enquiry.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can create enquiry.' });
    }

    const enquiryData = { ...req.body };

    const User = require('../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot create an enquiry.' });
    }
    enquiryData.added_by = req.user.reg_id; // Set added_by to current user
    if(!enquiryData.branch_id) {
      return res.status(400).json({ success: false, message: 'Branch ID is required.' });
    }
    const enquiry = await Enquiry.create(enquiryData);
    res.status(201).json({ success: true, data: enquiry });
  } catch (err) {
    next(err);
  }
};

exports.getEnquiry = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can view enquiry.' });
    // }
    const { branch_id } = req.body;

    if (!branch_id) {
      return res.status(400).json({ success: false, message: 'branch_id is required.' });
    }

    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view enquiry.' });
    }

    // Check branch_id exists and is not deleted
    const branch = await Branch.findOne({ where: { branch_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] } });
    if (!branch) {
      return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });
    }
    
    const enquiries = await Enquiry.findAll({ where: { status: { [Op.notIn]: [0, 2] }, branch_id:branch_id } });
    res.json({ success: true, data: enquiries });
  } catch (err) {
    next(err);
  }
};

exports.getEnquiryById = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can view enquiry.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view enquiry.' });
    }
    const enquiry = await Enquiry.findOne({ where: { enquiry_id: req.params.id, status: { [Op.notIn]: [0, 2] } } });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.json({ success: true, data: enquiry });
  } catch (err) {
    next(err);
  }
};

exports.updateEnquiry = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can update enquiry.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can update enquiry.' });
    }
    const enquiryData = { ...req.body };
    const { branch_id } = req.body;
    const branch = await Branch.findOne({ where: { branch_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] } });
    if (!branch) {
      return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(branch_id.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted branch cannot update an enquiry.' });
    }

    const User = require('../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot update an enquiry.' });
    }
    enquiryData.added_by = req.user.reg_id; // Set added_by to current user

    const enquiry = await Enquiry.findOne({ where: { enquiry_id: req.params.id, status: { [Op.notIn]: [0, 2] } } });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    await enquiry.update(enquiryData);
    res.json({ success: true, data: enquiry });
  } catch (err) {
    next(err);
  }
};

exports.deleteEnquiry = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can delete batcg.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can delete batcg.' });
    }
    const enquiry = await Enquiry.findOne({ where: { enquiry_id: req.params.id, status: { [Op.ne]: '2' } } });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    await enquiry.update({ status: '2' });
    res.json({ success: true, message: 'Enquiry soft deleted (status=2)' });
  } catch (err) {
    next(err);
  }
};

exports.changeStatus = async (req, res, next) => {
  try {
    // if (req.user.role !== ROLES.SUPER_ADMIN) {
    //   return res.status(403).json({ success: false, message: 'Only Super Admin can change enquiry status.' });
    // }
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can change enquiry status.' });
    }
    const { enquiry_status, reason } = req.body;
    const enquiry = await Enquiry.findOne({ where: { enquiry_id: req.params.id } });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    enquiry.enquiry_status = enquiry_status;
    enquiry.reason = reason;
    await enquiry.save();
    res.json({ success: true, data: enquiry });
  } catch (err) {
    next(err);
  }
}; 