// modules/users/user.model.js
// Sequelize model for User (registration)

const { DataTypes } = require('sequelize');
const db = require('../../config/db');

const User = db.define('User', {
  reg_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contact: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  role: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  added_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'registration',
  timestamps: true
});

module.exports = User; 