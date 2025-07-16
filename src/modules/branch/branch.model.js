// modules/branch/branch.model.js
// Sequelize model for Branch Master

const { DataTypes } = require('sequelize');
const db = require('../../config/db');

const Branch = db.define('Branch', {
  branch_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  branch_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  branch_code: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  institute_name: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.BIGINT(12),
    allowNull: false,
    unique: true
  },
  alternative_phone: {
    type: DataTypes.BIGINT(12),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  district: {
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
  established_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
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
  tableName: 'tbl_branch',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Branch; 