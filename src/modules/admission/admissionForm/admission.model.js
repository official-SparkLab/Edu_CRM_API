const { DataTypes } = require('sequelize');
const db = require('../../../config/db');

const Admission = db.define('Admission', {
  admission_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull:false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  contact: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  pincode: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  college_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  department: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  admission_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  reference: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  // admission_status: {
  //   type: DataTypes.STRING(255),
  //   allowNull: false,
  //   defaultValue: 'Pending'
  // },
  // reason: {
  //   type: DataTypes.STRING(255),
  //   allowNull: true
  // },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tbl_branch',
      key: 'branch_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
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
  tableName: 'tbl_admission',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Admission; 