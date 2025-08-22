// core/utils/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Create multer upload configuration for a specific module
 * @param {string} moduleName
 * @param {object} opts - { allowedMimes: [], limits: { fileSize } }
 */
const createUploadConfig = (moduleName, opts = {}) => {
  const baseDir = path.join(process.cwd(), 'uploads', moduleName);
  ensureDir(baseDir);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, baseDir);
    },
    filename: (req, file, cb) => {
      // sanitize extension and generate random filename
      const ext = path.extname(file.originalname).toLowerCase();
      const name = crypto.randomBytes(12).toString('hex') + Date.now();
      cb(null, `${name}${ext}`);
    },
  });

  // default allowed mimes: images + common documents + compressed
  const defaultAllowed = [
    // images
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    // documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    // 'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
    'text/plain',
    'text/csv',
    // compressed
    // 'application/zip',
    // 'application/x-7z-compressed',
    // 'application/x-rar-compressed',
    // add others if needed
  ];

  const allowed = opts.allowedMimes || defaultAllowed;

  const fileFilter = (req, file, cb) => {
    if (allowed.includes(file.mimetype)) return cb(null, true);
    const err = new Error('Invalid file type');
    err.code = 'INVALID_FILE_TYPE';
    return cb(err);
  };

  // default: 10 MB
  const limits = opts.limits || { fileSize: 10 * 1024 * 1024 };

  return multer({ storage, fileFilter, limits });
};

const getRelativePath = (moduleName, filename) => {
  // leading slash is convenient for building public URLs
  return `/uploads/${moduleName}/${filename}`;
};

module.exports = {
  createUploadConfig,
  getRelativePath,
};
