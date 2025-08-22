const { DataTypes } = require('sequelize');
const db = require('../../../config/db');

const Document = db.define('Document', {
  document_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  document_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'tbl_document',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});


const Admission = require('../../admission/admissionForm/admission.model');

Admission.hasMany(Document, { foreignKey: 'admission_id', as: 'documents' });
Document.belongsTo(Admission, { foreignKey: 'admission_id', as: 'admission' });

module.exports = Document; 