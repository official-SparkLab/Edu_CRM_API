const Enquiry = require('./enquiry.model');
const { STATUS, ROLES } = require('../../core/constants');
const Branch = require('../branch/branch.model');
const { Op } = require('sequelize');
const cacheService = require('../../core/services/cache.service'); // cache service

// cache keys
const CACHE_PREFIX = 'enquiry_';
const LIST_CACHE_PREFIX = 'enquiry_list_';

function toPlain(instance) {
  if (!instance) return null;
  if (typeof instance.get === 'function') return instance.get({ plain: true });
  return instance;
}

// Create Enquiry
exports.createEnquiry = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can create enquiry.' });
    }

    const enquiryData = { ...req.body };
    const User = require('../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) return res.status(404).json({ success: false, message: 'User not found.' });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot create an enquiry.' });
    }

    if (!enquiryData.branch_id) return res.status(400).json({ success: false, message: 'Branch ID is required.' });
    enquiryData.added_by = req.user.reg_id;

    const enquiry = await Enquiry.create(enquiryData);

    // invalidate cache
    await cacheService.del(`${LIST_CACHE_PREFIX}${enquiry.branch_id}`);
    await cacheService.set(`${CACHE_PREFIX}${enquiry.enquiry_id}`, toPlain(enquiry));

    res.status(201).json({ success: true, data: enquiry });
  } catch (err) {
    next(err);
  }
};

// Get Enquiries (with caching)
exports.getEnquiry = async (req, res, next) => {
  try {
    const { branch_id, start, end } = req.body;
    if (!branch_id) return res.status(400).json({ success: false, message: "branch_id is required." });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: "Only Active User can view enquiry." });
    }

    const branch = await Branch.findOne({ where: { branch_id, status: { [Op.in]: [STATUS.ACTIVE, STATUS.INACTIVE] } } });
    if (!branch) return res.status(400).json({ success: false, message: "Invalid or deleted branch_id." });

    const cacheKey = `${LIST_CACHE_PREFIX}${branch_id}_${start || 'null'}_${end || 'null'}`;
    let cachedData = await cacheService.get(cacheKey);
    if (cachedData) return res.json({ success: true, data: cachedData });

    const whereClause = {
      status: { [Op.notIn]: [STATUS.INACTIVE, STATUS.DELETE] },
      branch_id
    };

    const startDate = start ? start.toString() : null;
    const endDate = end ? end.toString() : null;

    if (startDate && endDate) {
      whereClause.enquiry_date = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      whereClause.enquiry_date = { [Op.gte]: startDate };
    } else if (endDate) {
      whereClause.enquiry_date = { [Op.lte]: endDate };
    } else {
      const today = new Date().toISOString().split("T")[0];
      whereClause.enquiry_date = today;
    }

    const enquiries = await Enquiry.findAll({ where: whereClause, order: [["enquiry_date", "DESC"]] });
    const plainData = enquiries.map(toPlain);

    await cacheService.set(cacheKey, plainData);

    res.json({ success: true, data: plainData });
  } catch (err) {
    next(err);
  }
};

// Get Enquiry by ID (with caching)
exports.getEnquiryById = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can view enquiry.' });
    }

    const cacheKey = `${CACHE_PREFIX}${req.params.id}`;
    let enquiry = await cacheService.get(cacheKey);

    if (!enquiry) {
      const row = await Enquiry.findOne({ where: { enquiry_id: req.params.id, status: { [Op.notIn]: [STATUS.INACTIVE, STATUS.DELETE] } } });
      if (!row) return res.status(404).json({ success: false, message: 'Enquiry not found' });
      enquiry = toPlain(row);
      await cacheService.set(cacheKey, enquiry);
    }

    res.json({ success: true, data: enquiry });
  } catch (err) {
    next(err);
  }
};

// Update Enquiry
exports.updateEnquiry = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can update enquiry.' });
    }

    const enquiryData = { ...req.body };
    const { branch_id } = req.body;

    const branch = await Branch.findOne({ where: { branch_id, status: { [Op.in]: [STATUS.ACTIVE, STATUS.INACTIVE] } } });
    if (!branch) return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });

    const User = require('../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) return res.status(404).json({ success: false, message: 'User not found.' });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot update an enquiry.' });
    }

    enquiryData.added_by = req.user.reg_id;
    const enquiry = await Enquiry.findOne({ where: { enquiry_id: req.params.id, status: { [Op.notIn]: [STATUS.INACTIVE, STATUS.DELETE] } } });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });

    await enquiry.update(enquiryData);

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${enquiry.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${enquiry.enquiry_id}`);
    await cacheService.set(`${CACHE_PREFIX}${enquiry.enquiry_id}`, toPlain(enquiry));

    res.json({ success: true, data: enquiry });
  } catch (err) {
    next(err);
  }
};

// Delete Enquiry (soft)
exports.deleteEnquiry = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can delete enquiry.' });
    }

    const enquiry = await Enquiry.findOne({ where: { enquiry_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });

    await enquiry.update({ status: STATUS.DELETE });

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${enquiry.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${enquiry.enquiry_id}`);

    res.json({ success: true, message: 'Enquiry soft deleted (status=0)' });
  } catch (err) {
    next(err);
  }
};

// Change Status
exports.changeStatus = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can change enquiry status.' });
    }

    const { enquiry_status, reason } = req.body;
    const enquiry = await Enquiry.findOne({ where: { enquiry_id: req.params.id } });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });

    enquiry.enquiry_status = enquiry_status;
    enquiry.reason = reason;
    await enquiry.save();

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${enquiry.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${enquiry.enquiry_id}`);
    await cacheService.set(`${CACHE_PREFIX}${enquiry.enquiry_id}`, toPlain(enquiry));

    res.json({ success: true, data: enquiry });
  } catch (err) {
    next(err);
  }
};


























//WITHOUT CACHE =>

// const Enquiry = require('./enquiry.model');
// const { STATUS, ROLES } = require('../../core/constants');
// const Branch = require('../branch/branch.model');
// const { Op } = require('sequelize');

// exports.createEnquiry = async (req, res, next) => {
//   try {
//     // if (req.user.role !== ROLES.SUPER_ADMIN) {
//     //   return res.status(403).json({ success: false, message: 'Only Super Admin can create enquiry.' });
//     // }
//     if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
//       return res.status(403).json({ success: false, message: 'Only Active User can create enquiry.' });
//     }

//     const enquiryData = { ...req.body };

//     const User = require('../users/user.model');
//     const addedByUser = await User.findByPk(req.user.reg_id);
//     if (!addedByUser) {
//       return res.status(404).json({ success: false, message: 'User not found.' });
//     }

//     if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
//       return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot create an enquiry.' });
//     }
//     enquiryData.added_by = req.user.reg_id; // Set added_by to current user
//     if(!enquiryData.branch_id) {
//       return res.status(400).json({ success: false, message: 'Branch ID is required.' });
//     }
//     const enquiry = await Enquiry.create(enquiryData);
//     res.status(201).json({ success: true, data: enquiry });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.getEnquiry = async (req, res, next) => {
//   try {
//     const { branch_id, start, end } = req.body;

//     if (!branch_id) {
//       return res.status(400).json({ success: false, message: "branch_id is required." });
//     }

//     if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
//       return res.status(403).json({ success: false, message: "Only Active User can view enquiry." });
//     }

//     const branch = await Branch.findOne({
//       where: { branch_id, status: { [Op.in]: [STATUS.ACTIVE, STATUS.INACTIVE] } }
//     });

//     if (!branch) {
//       return res.status(400).json({ success: false, message: "Invalid or deleted branch_id." });
//     }

//     const whereClause = {
//       status: { [Op.notIn]: [STATUS.INACTIVE, STATUS.DELETE] },
//       branch_id
//     };

//     const startDate = start ? start.toString() : null;
//     const endDate = end ? end.toString() : null;

//     if (startDate && endDate) {
//       whereClause.enquiry_date = { [Op.between]: [startDate, endDate] };
//     } else if (startDate) {
//       whereClause.enquiry_date = { [Op.gte]: startDate };
//     } else if (endDate) {
//       whereClause.enquiry_date = { [Op.lte]: endDate };
//     } else {
//       // Default to today's enquiries
//       const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
//       whereClause.enquiry_date = today;
//     }

//     console.log("WHERE CLAUSE:", whereClause); // 🔥 Debug log

//     const enquiries = await Enquiry.findAll({
//       where: whereClause,
//       order: [["enquiry_date", "DESC"]],
//     });

//     res.json({ success: true, data: enquiries });
//   } catch (err) {
//     next(err);
//   }
// };


// exports.getEnquiryById = async (req, res, next) => {
//   try {
//     // if (req.user.role !== ROLES.SUPER_ADMIN) {
//     //   return res.status(403).json({ success: false, message: 'Only Super Admin can view enquiry.' });
//     // }
//     if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
//       return res.status(403).json({ success: false, message: 'Only Active User can view enquiry.' });
//     }
//     const enquiry = await Enquiry.findOne({ where: { enquiry_id: req.params.id, status: { [Op.notIn]: [STATUS.INACTIVE, STATUS.DELETE] } } });
//     if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
//     res.json({ success: true, data: enquiry });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.updateEnquiry = async (req, res, next) => {
//   try {
//     // if (req.user.role !== ROLES.SUPER_ADMIN) {
//     //   return res.status(403).json({ success: false, message: 'Only Super Admin can update enquiry.' });
//     // }
//     if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
//       return res.status(403).json({ success: false, message: 'Only Active User can update enquiry.' });
//     }
//     const enquiryData = { ...req.body };
//     const { branch_id } = req.body;
//     const branch = await Branch.findOne({ where: { branch_id, status: [STATUS.ACTIVE, STATUS.INACTIVE] } });
//     if (!branch) {
//       return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });
//     }
//     if ([STATUS.INACTIVE, STATUS.DELETE].includes(branch_id.status)) {
//       return res.status(403).json({ success: false, message: 'Inactive or deleted branch cannot update an enquiry.' });
//     }

//     const User = require('../users/user.model');
//     const addedByUser = await User.findByPk(req.user.reg_id);
//     if (!addedByUser) {
//       return res.status(404).json({ success: false, message: 'User not found.' });
//     }
//     if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
//       return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot update an enquiry.' });
//     }
//     enquiryData.added_by = req.user.reg_id; // Set added_by to current user

//     const enquiry = await Enquiry.findOne({ where: { enquiry_id: req.params.id, status: { [Op.notIn]: [STATUS.INACTIVE, STATUS.DELETE] } } });
//     if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
//     await enquiry.update(enquiryData);
//     res.json({ success: true, data: enquiry });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.deleteEnquiry = async (req, res, next) => {
//   try {
//     // if (req.user.role !== ROLES.SUPER_ADMIN) {
//     //   return res.status(403).json({ success: false, message: 'Only Super Admin can delete batcg.' });
//     // }
//     if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
//       return res.status(403).json({ success: false, message: 'Only Active User can delete batcg.' });
//     }
//     const enquiry = await Enquiry.findOne({ where: { enquiry_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
//     if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
//     await enquiry.update({ status: '0' });
//     res.json({ success: true, message: 'Enquiry soft deleted (status=0)' });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.changeStatus = async (req, res, next) => {
//   try {
//     // if (req.user.role !== ROLES.SUPER_ADMIN) {
//     //   return res.status(403).json({ success: false, message: 'Only Super Admin can change enquiry status.' });
//     // }
//     if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
//       return res.status(403).json({ success: false, message: 'Only Active User can change enquiry status.' });
//     }
//     const { enquiry_status, reason } = req.body;
//     const enquiry = await Enquiry.findOne({ where: { enquiry_id: req.params.id } });
//     if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
//     enquiry.enquiry_status = enquiry_status;
//     enquiry.reason = reason;
//     await enquiry.save();
//     res.json({ success: true, data: enquiry });
//   } catch (err) {
//     next(err);
//   }
// }; 