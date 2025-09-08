const { DataTypes } = require('sequelize');
const db = require('../../../config/db');

const PaymentCourse = db.define('PaymentCourse', {
  pay_course_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  admission_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tbl_admission',
      key: 'admission_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  adm_course_id: {                          // New foreign key field
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tbl_admission_course',
      key: 'adm_course_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  section_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tbl_section',
      key: 'section_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  amount_paid: {
    type: DataTypes.STRING(255),  // changed from DECIMAL to VARCHAR
    allowNull: false
  },
  payment_mode: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  received_by: {
    type: DataTypes.STRING(255),
    allowNull: false // user_name who received payment
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
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
  tableName: 'tbl_payment_course',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PaymentCourse; 