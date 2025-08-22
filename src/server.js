// server.js
// Entry point for CRM backend server

const app = require('./app');
const db = require('./config/db');
require('dotenv').config();
require('./associations');
const PORT = process.env.PORT || 5000;

// Connect to MySQL database and sync models (auto-create tables)
(async () => {
  try {
    await db.authenticate();
    console.log('Database connected successfully.');
    // await db.sync();
    // console.log('All tables created (if they did not exist).');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ DB connection failed:', error.message);
  console.error(error); // shows stack trace
  process.exit(1);
  }
})(); 