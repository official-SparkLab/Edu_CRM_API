// config/db.js
// Sequelize MySQL connection setup for CRM backend

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'crm',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || 'admin',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize; 