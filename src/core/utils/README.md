# File Upload Utility
This utility provides a standardized way to handle file uploads across different modules in the CRM backend.
## Features
- **Module-specific folders**: Files are stored in `uploads/{moduleName}/` directories
- **Automatic directory creation**: Creates upload directories if they don't exist
- **Unique filenames**: Generates unique filenames with timestamps to prevent conflicts
- **Database path storage**: Stores relative paths with leading slash (e.g., `/uploads/institute/logo.png`)
## Usage
### 1. In Routes File
```javascript
const { createUploadConfig } = require('../../core/utils');
// Create upload configuration for your module
const upload = createUploadConfig('your-module-name');
// Use in routes
router.post('/', authenticate, upload.single('fieldName'), validator, controller);
router.put('/:id', authenticate, upload.single('fieldName'), validator, controller);
```
### 2. In Controller File
```javascript
const { getRelativePath } = require('../../core/utils');
// In create method
if (req.file) {
  data.fieldName = getRelativePath('your-module-name', req.file.filename);
}
// In update method
const updateData = { ...req.body };
if (req.file) {
  updateData.fieldName = getRelativePath('your-module-name', req.file.filename);
}
```
### 3. In Model File
Add a field to store the file path:
```javascript
fieldName: {
  type: DataTypes.TEXT,
  allowNull: true
}
```
## Example Implementation
### Institute Module (Already Implemented)
**Routes** (`src/modules/institute/institute.routes.js`):
```javascript
const { createUploadConfig } = require('../../core/utils');
const upload = createUploadConfig('institute');
router.post('/', authenticate, upload.single('logo'), validator, controller);
```
**Controller** (`src/modules/institute/institute.controller.js`):
```javascript
const { getRelativePath } = require('../../core/utils');
if (req.file) {
  instituteData.logo = getRelativePath('institute', req.file.filename);
}
```
## File Storage Structure
```
uploads/
├── institute/
│   ├── 1703123456789-123456789-logo.png
│   └── 1703123456790-987654321-logo.jpg
├── users/
│   ├── 1703123456791-111222333-profile.jpg
│   └── 1703123456792-444555666-avatar.png
└── course/
    ├── 1703123456793-777888999-syllabus.pdf
    └── 1703123456794-000111222-material.docx
```
## Database Storage
Files are stored in the database with paths like:
- `/uploads/institute/1703123456789-123456789-logo.png`
- `/uploads/users/1703123456791-111222333-profile.jpg`
## Static File Serving
Files are automatically served at `/uploads/{moduleName}/{filename}` through Express static middleware configured in `app.js`.
## Security Considerations
- Files are stored outside the application root
- Unique filenames prevent path traversal attacks
- File types should be validated in validators
- File size limits can be configured in multer options