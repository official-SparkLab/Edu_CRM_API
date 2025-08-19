// modules/branch/branch.service.js
// Branch-related business logic with node-cache caching

const Branch = require('./branch.model');
const User = require('../users/user.model');
const { ROLES, STATUS } = require('../../core/constants');
const { Op } = require('sequelize');
const cacheService = require('../../core/services/cache.service');

class BranchService {
  constructor() {
    this.cachePrefix = 'branch_';
    this.listCacheKey = 'branch_list';
  }

  async createBranch(branchData, addedByUserId) {
    const { branch_name, branch_code, institute_name, email, phone, alternative_phone, address, district, state, pincode, established_date } = branchData;

    // Check if addedBy user is active and has SUPER_ADMIN role
    const addedByUser = await User.findByPk(addedByUserId);
    if (!addedByUser || addedByUser.status === STATUS.DELETE || addedByUser.status === STATUS.INACTIVE || addedByUser.role !== ROLES.SUPER_ADMIN) {
      throw new Error('Unauthorized: Only active Super-Admin users can add new branches.');
    }

    const branch = await Branch.create({
      branch_name,
      branch_code,
      institute_name,
      email,
      phone,
      alternative_phone,
      address,
      district,
      state,
      pincode,
      established_date,
      added_by: addedByUserId,
      status: STATUS.ACTIVE
    });

    // Invalidate branch list cache
    await cacheService.del(this.listCacheKey);
    // Cache individual branch
    await cacheService.set(`${this.cachePrefix}${branch.branch_id}`, branch);

    return branch;
  }

  async updateBranch(branch_id, branchData, addedByUserId) {
    const { branch_name, branch_code, institute_name, email, phone, alternative_phone, address, district, state, pincode, established_date } = branchData;

    // Check if addedBy user is active and has SUPER_ADMIN role
    const addedByUser = await User.findByPk(addedByUserId);
    if (!addedByUser || addedByUser.status === STATUS.DELETE || addedByUser.status === STATUS.INACTIVE || addedByUser.role !== ROLES.SUPER_ADMIN) {
      throw new Error('Unauthorized: Only active Super-Admin users can update branches.');
    }

    const branch = await Branch.findByPk(branch_id);
    if (!branch) {
      throw new Error('Branch not found.');
    }
    if (branch.status === STATUS.DELETE) {
      throw new Error('Cannot update a deleted branch.');
    }

    if (branch_name) branch.branch_name = branch_name;
    if (branch_code) branch.branch_code = branch_code;
    if (institute_name) branch.institute_name = institute_name;
    if (email) branch.email = email;
    if (phone) branch.phone = phone;
    if (alternative_phone) branch.alternative_phone = alternative_phone;
    if (address) branch.address = address;
    if (district) branch.district = district;
    if (state) branch.state = state;
    if (pincode) branch.pincode = pincode;
    if (established_date) branch.established_date = established_date;
    branch.added_by = addedByUserId;

    await branch.save();

    // Invalidate branch list cache
    await cacheService.del(this.listCacheKey);
    // Update individual branch cache
    await cacheService.set(`${this.cachePrefix}${branch.branch_id}`, branch);

    return branch;
  }

  async fetchBranchList(sessionUserId) {
    // Check if session user is active and has SUPER_ADMIN role
    const sessionUser = await User.findByPk(sessionUserId);
    if (!sessionUser || sessionUser.status === STATUS.DELETE || sessionUser.status === STATUS.INACTIVE || sessionUser.role !== ROLES.SUPER_ADMIN) {
      throw new Error('Unauthorized: Only active Super-Admin users can fetch branch list.');
    }

    let branches = await cacheService.get(this.listCacheKey);

    if (!branches) {
      branches = await Branch.findAll({ where: { status: { [Op.ne]: STATUS.DELETE } } });
      await cacheService.set(this.listCacheKey, branches);
    }

    return branches;
  }

  async deleteBranch(branch_id, sessionUserId) {
    // Check if session user is active and has SUPER_ADMIN role
    const sessionUser = await User.findByPk(sessionUserId);
    if (!sessionUser || sessionUser.status === STATUS.DELETE || sessionUser.status === STATUS.INACTIVE || sessionUser.role !== ROLES.SUPER_ADMIN) {
      throw new Error('Unauthorized: Only active Super-Admin users can delete branches.');
    }

    const branch = await Branch.findOne({ where: { branch_id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!branch) {
      throw new Error('Branch not found.');
    }

    await branch.update({ status: STATUS.DELETE });

    // Invalidate branch list cache
    await cacheService.del(this.listCacheKey);
    // Delete individual branch cache
    await cacheService.del(`${this.cachePrefix}${branch.branch_id}`);

    return { message: 'Branch soft deleted (status=2).' };
  }

  async changeStatus(branch_id, status, sessionUserId) {
    // Check if session user is active and has SUPER_ADMIN role
    const sessionUser = await User.findByPk(sessionUserId);
    if (!sessionUser || sessionUser.status === STATUS.DELETE || sessionUser.status === STATUS.INACTIVE || sessionUser.role !== ROLES.SUPER_ADMIN) {
      throw new Error('Unauthorized: Only active Super-Admin users can change branch status.');
    }

    const branch = await Branch.findOne({ where: { branch_id } });
    if (!branch) {
      throw new Error('Branch not found.');
    }

    branch.status = status;
    await branch.save();

    // Invalidate branch list cache
    await cacheService.del(this.listCacheKey);
    // Update individual branch cache
    await cacheService.set(`${this.cachePrefix}${branch.branch_id}`, branch);

    return branch;
  }

  async fetchBranchById(branch_id, sessionUserId) {
    // Check if session user is active and has SUPER_ADMIN role
    const sessionUser = await User.findByPk(sessionUserId);
    if (!sessionUser || sessionUser.status === STATUS.DELETE || sessionUser.status === STATUS.INACTIVE || sessionUser.role !== ROLES.SUPER_ADMIN) {
      throw new Error('Unauthorized: Only active Super-Admin users can fetch branch by ID.');
    }

    const cacheKey = `${this.cachePrefix}${branch_id}`;
    let branch = await cacheService.get(cacheKey);

    if (!branch) {
      branch = await Branch.findOne({ where: { branch_id, status: { [Op.ne]: STATUS.DELETE } } });
      if (branch) {
        await cacheService.set(cacheKey, branch);
      }
    }

    if (!branch) {
      throw new Error('Branch not found.');
    }

    return branch;
  }
}

module.exports = new BranchService();