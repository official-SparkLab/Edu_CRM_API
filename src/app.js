// app.js
// Main Express app setup for CRM backend
// Uses best practices, security middleware, and modular routing

const express = require('express');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path'); // ✅ Add this line
const errorHandler = require('./core/error-handler');
// const oasGenerator = require('express-oas-generator');
const multer = require('multer');
// const upload = multer();

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const userFetchRoutes = require('./modules/users/user.fetchRoutes');
const branchRoutes = require('./modules/branch/branch.routes');
const instituteRoutes = require('./modules/institute/institute.routes');
const instituteBranchData = require('./modules/institute/instituteBranchData.routes');
const sectionRoutes = require('./modules/section/section.routes');
const courseRoutes = require('./modules/course/course.routes');
const courseFetchRoutes = require('./modules/course/course.fetchRoutes');
const batchRoutes = require('./modules/batch/batch.routes');
const batchFetchRoutes = require('./modules/batch/batch.fetchRoutes');
const batchCourseFetchRoutes = require('./modules/batch/batchCourse.fetchRoutes');
const serviceRoutes = require('./modules/service/service.routes');
const serviceFetchRoutes = require('./modules/service/service.fetchRoutes');
const enquiryRoutes = require('./modules/enquiry/enquiry.routes');
const enquiryFetchRoutes = require('./modules/enquiry/enquiry.fetchRoutes');
const admissionFormRoutes = require('./modules/admission/admissionForm/admission.routes');
const documentFormRoutes = require('./modules/admission/document/document.routes');
const admissionCourseFormRoutes = require('./modules/admission/admissionCourse/admissionCourse.routes');
const admissionServiceFormRoutes = require('./modules/admission/admissionService/admissionService.routes');
const admissionFetchRoutes = require('./modules/admission/admission.fetchRoutes');
const paymentCourseRoutes = require('./modules/payment/paymentCourse/paymentCourse.routes');
const paymentCourseFetchRoutes = require('./modules/payment/paymentCourse/paymentCourseFetch.routes');
const paymentCourseFetchByAdmissionIdRoutes = require('./modules/payment/paymentCourse/paymentCourseFetchByAdmissionId.routes');
const paymentServiceRoutes = require('./modules/payment/paymentService/paymentService.routes');
const paymentServiceFetchRoutes = require('./modules/payment/paymentService/paymentServiceFetch.routes');
const paymentServiceFetchByAdmissionIdRoutes = require('./modules/payment/paymentService/paymentServiceFetchByAdmissionId.routes');

const app = express();

// Initialize express-oas-generator before routes
// oasGenerator.init(app, {});

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin); // Allow all urls for development later change to specific origins
  },
  // origin: 'http://localhost:3000', // Update as needed
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Support urlencoded form data
// app.use(upload.none()); // Support multipart/form-data without files
app.use(cookieParser());
app.use(morgan('dev'));

// ✅ Serve uploaded files publicly
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// === 1) GLOBAL RATE LIMITER (apply to all requests) ===
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                  // limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(globalLimiter);


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user-list', userFetchRoutes);
app.use('/api/branch', branchRoutes);
app.use('/api/institute', instituteRoutes);
app.use('/api/instituteBranchData', instituteBranchData);
app.use('/api/section', sectionRoutes);
app.use('/api/course', courseRoutes); // Course routes
app.use('/api/course-list', courseFetchRoutes); // Course routes
app.use('/api/batch', batchRoutes); // Batch routes
app.use('/api/batch-list', batchFetchRoutes); // Batch routes
app.use('/api/batch-course', batchCourseFetchRoutes); // Batch routes
app.use('/api/service', serviceRoutes); // Service routes
app.use('/api/service-list', serviceFetchRoutes); // Service Fetch routes
app.use('/api/enquiry', enquiryRoutes); // Enquiry routes
app.use('/api/enquiry-list', enquiryFetchRoutes); // Enquiry Fetch routes
app.use('/api/admission', admissionFormRoutes); // Admission Form routes
app.use('/api/admission-document', documentFormRoutes); // Admission Document routes
app.use('/api/admission-course', admissionCourseFormRoutes); // Admission Course routes
app.use('/api/admission-service', admissionServiceFormRoutes); // Admission Service routes
app.use('/api/admission-list', admissionFetchRoutes); // Admission List Fetch routes
app.use('/api/paymentCourse', paymentCourseRoutes); // Payment Course routes
app.use('/api/paymentCourse-list', paymentCourseFetchRoutes); // Payment Course List Fetch Fetch routes
app.use('/api/paymentCourse-admissionID', paymentCourseFetchByAdmissionIdRoutes); // Payment Course Fetch By Admission Id routes
app.use('/api/paymentService', paymentServiceRoutes); // Payment Service routes
app.use('/api/paymentService-list', paymentServiceFetchRoutes); // Payment Service List Fetch Fetch routes
app.use('/api/paymentService-admissionID', paymentServiceFetchByAdmissionIdRoutes); // Payment Service Fetch By Admission Id routes

app.get('/base', (req, res) => {
  res.send('Node.js base working!');
});


app.get('/health', async (req, res) => {
  const poolOk = !!(db.connectionManager && db.connectionManager.pool);
  res.json({ status: poolOk ? 'OK' : 'DOWN' });
  // try {
  //   await db.authenticate();
  //   res.json({ status: 'OK', db: 'reachable' });
  // } catch {
  //   res.status(503).json({ status: 'DOWN', db: 'unreachable' });
  // }
});


// Swagger docs available at /api-docs

// Error handler
app.use(errorHandler);

module.exports = app; 