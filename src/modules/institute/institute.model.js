const { DataTypes } = require('sequelize');
const db = require('../../config/db');

const Institute = db.define('Institute', {
  inst_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  inst_name: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  reg_no: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  gst_no: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phone_no: {
    type: DataTypes.BIGINT(12),
    allowNull: false
  },
  alt_phone: {
    type: DataTypes.BIGINT(12),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  Dist: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  pin_no: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  logo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estd_year: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  director: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(255),
    defaultValue: 'active'
  },
  added_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'tbl_institute',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Institute; 