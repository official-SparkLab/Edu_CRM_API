const express = require('express');
const router = express.Router();
const documentController = require('./document.controller');
const documentValidator = require('./document.validator');
const { validate } = require('../../../core/utils/validator');
const { authenticate } = require('../../../core/middleware/auth.middleware');
const { createUploadConfig } = require('../../../core/utils');

// ✅ Configure Multer for admission documents
// saves in uploads/admission-documents/
const upload = createUploadConfig('admission-documents', { limits: { fileSize: 10 * 1024 * 1024 } });

router.post(
  '/',
  authenticate,
  upload.single('file'),  // <--- field name in form-data
  documentValidator.createDocument,
  validate,
  documentController.createDocument
);

router.put(
  '/:id',
  authenticate,
  upload.single('file'),
  documentValidator.updateDocument,
  validate,
  documentController.updateDocument
);

router.delete('/:id', authenticate, documentController.deleteDocument);

module.exports = router;
