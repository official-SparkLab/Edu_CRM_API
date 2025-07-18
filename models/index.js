'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// After loading all models, define associations if present
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Define associations after all models are loaded
if (db.User && db.Branch) {
  db.User.belongsTo(db.Branch, { foreignKey: 'branch_id', as: 'branch' });
  db.Branch.hasMany(db.User, { foreignKey: 'branch_id', as: 'users' });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Add Sequelize sync logic to auto-create DB and tables
if (process.env.NODE_ENV !== 'test') {
  db.sequelize.sync({ force: false, alter: false })
    .then(() => {
      console.log('Database & tables synced!');
    })
    .catch((err) => {
      console.error('Sequelize sync error:', err);
    });
}

module.exports = db;
