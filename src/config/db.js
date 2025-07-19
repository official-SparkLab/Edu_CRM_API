// config/db.js
// Sequelize MySQL connection setup for CRM backend

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ranufnma_edu_crm',
  process.env.DB_USER || 'ranufnma_root',
  process.env.DB_PASS || 'sparklabit@123',
  {
    host: process.env.DB_HOST || '103.102.234.200',
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