// modules/admission/document/document.controller.js

const Document = require('./document.model');
const { STATUS } = require('../../../core/constants');
const Branch = require('../../branch/branch.model');
const { Op } = require('sequelize');
const cacheService = require('../../../core/services/cache.service');
const { getRelativePath } = require("../../../core/utils");

// cache keys
const CACHE_PREFIX = 'document_';
const LIST_CACHE_PREFIX = 'document_list_';

function toPlain(instance) {
  if (!instance) return null;
  if (typeof instance.get === 'function') return instance.get({ plain: true });
  return instance;
}

// ======================== CREATE DOCUMENT ========================
exports.createDocument = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can create document.' });
    }

    const documentData = { ...req.body };

    // ✅ Save uploaded file path if exists
    if (req.file) {
      documentData.file = getRelativePath("admission-documents", req.file.filename);
    }

    const User = require('../../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) return res.status(404).json({ success: false, message: 'User not found.' });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot create a document.' });
    }

    if (!documentData.branch_id) return res.status(400).json({ success: false, message: 'Branch ID is required.' });
    documentData.added_by = req.user.reg_id;

    const document = await Document.create(documentData);

    // invalidate cache
    await cacheService.del(`${LIST_CACHE_PREFIX}${document.branch_id}`);
    await cacheService.set(`${CACHE_PREFIX}${document.document_id}`, toPlain(document));

    res.status(201).json({ success: true, data: document });
  } catch (err) {
    next(err);
  }
};

// ======================== UPDATE DOCUMENT ========================
exports.updateDocument = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can update document.' });
    }

    const documentData = { ...req.body };

    // ✅ Handle file upload replacement
    if (req.file) {
      documentData.document_name = getRelativePath("admission-documents", req.file.filename);
    }

    const { branch_id } = req.body;
    const branch = await Branch.findOne({ where: { branch_id, status: { [Op.in]: [STATUS.ACTIVE, STATUS.INACTIVE] } } });
    if (!branch) return res.status(400).json({ success: false, message: 'Invalid or deleted branch_id.' });

    const User = require('../../users/user.model');
    const addedByUser = await User.findByPk(req.user.reg_id);
    if (!addedByUser) return res.status(404).json({ success: false, message: 'User not found.' });
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(addedByUser.status)) {
      return res.status(403).json({ success: false, message: 'Inactive or deleted users cannot update a document.' });
    }

    documentData.added_by = req.user.reg_id;

    const document = await Document.findOne({ where: { document_id: req.params.id, status: { [Op.notIn]: [STATUS.INACTIVE, STATUS.DELETE] } } });
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

    await document.update(documentData);

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${document.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${document.document_id}`);
    await cacheService.set(`${CACHE_PREFIX}${document.document_id}`, toPlain(document));

    res.json({ success: true, data: document });
  } catch (err) {
    next(err);
  }
};

// ======================== DELETE DOCUMENT (SOFT) ========================
exports.deleteDocument = async (req, res, next) => {
  try {
    if ([STATUS.INACTIVE, STATUS.DELETE].includes(req.user.status)) {
      return res.status(403).json({ success: false, message: 'Only Active User can delete document.' });
    }

    const document = await Document.findOne({ where: { document_id: req.params.id, status: { [Op.ne]: STATUS.DELETE } } });
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

    await document.update({ status: STATUS.DELETE });

    // invalidate caches
    await cacheService.del(`${LIST_CACHE_PREFIX}${document.branch_id}`);
    await cacheService.del(`${CACHE_PREFIX}${document.document_id}`);

    res.json({ success: true, message: 'Document soft deleted (status=0)' });
  } catch (err) {
    next(err);
  }
};
