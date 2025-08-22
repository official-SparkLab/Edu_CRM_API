const { DataTypes } = require('sequelize');
const db = require('../../../config/db');

const AdmissionService = db.define('AdmissionService', {
  adm_service_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  service_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tbl_service',
      key: 'service_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
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
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1
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
  tableName: 'tbl_admission_service',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Admission = require('../../admission/admissionForm/admission.model');

Admission.hasMany(AdmissionService, { foreignKey: 'admission_id', as: 'services' });
AdmissionService.belongsTo(Admission, { foreignKey: 'admission_id', as: 'admission' });

module.exports = AdmissionService; 