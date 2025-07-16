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
    type: DataTypes.STRING,
    allowNull: false
  },
  branch_code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  institute_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  alternative_phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  district: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  established_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  added_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'branch',
  timestamps: true
});

module.exports = Branch; 