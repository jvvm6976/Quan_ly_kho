const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const InventoryCheck = sequelize.define('InventoryCheck', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  checkNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Define relationships
InventoryCheck.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
InventoryCheck.belongsTo(User, { foreignKey: 'completedBy', as: 'completer' });

module.exports = InventoryCheck;
