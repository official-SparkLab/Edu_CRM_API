const { DataTypes } = require('sequelize');
const db = require('../../config/db');

const Payment = db.define('Payment', {
  payment_id: {
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
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  amount_paid: {
    type: DataTypes.DECIMAL(10,2), // better than TEXT for money
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
  tableName: 'tbl_payment',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Payment; 