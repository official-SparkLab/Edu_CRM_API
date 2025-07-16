// app.js
// Main Express app setup for CRM backend
// Uses best practices, security middleware, and modular routing

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./core/error-handler');
const oasGenerator = require('express-oas-generator');
const multer = require('multer');
const upload = multer();

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const branchRoutes = require('./modules/branch/branch.routes');
const instituteRoutes = require('./modules/institute/institute.routes');
const sectionRoutes = require('./modules/section/section.routes');

const app = express();

// Initialize express-oas-generator before routes
oasGenerator.init(app, {});

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: 'http://localhost:3000', // Update as needed
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Support urlencoded form data
app.use(upload.none()); // Support multipart/form-data without files
app.use(cookieParser());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/branch', branchRoutes);
app.use('/api/institutes', instituteRoutes);
app.use('/api/sections', sectionRoutes);

// Swagger docs available at /api-docs

// Error handler
app.use(errorHandler);

module.exports = app; 