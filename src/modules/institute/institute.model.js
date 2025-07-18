const { DataTypes } = require('sequelize');
const db = require('../../config/db');

const Institute = db.define('Institute', {
  institute_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  institute_name: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  registration_no: {
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
  alternative_phone: {
    type: DataTypes.BIGINT(12),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  dist: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  pincode: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  logo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  established_year: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  director_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(255),
    defaultValue: 1
  },
  added_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tbl_registration',
      key: 'reg_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
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