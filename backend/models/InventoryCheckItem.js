const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const InventoryCheck = require('./InventoryCheck');
const Product = require('./Product');
const User = require('./User');

const InventoryCheckItem = sequelize.define('InventoryCheckItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  systemQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  actualQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  difference: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'checked', 'adjusted'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Define relationships
InventoryCheckItem.belongsTo(InventoryCheck, { foreignKey: 'checkId', as: 'check' });
InventoryCheckItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
InventoryCheckItem.belongsTo(User, { foreignKey: 'checkedBy', as: 'checker' });

// Add association to InventoryCheck model
InventoryCheck.hasMany(InventoryCheckItem, { foreignKey: 'checkId', as: 'items' });

module.exports = InventoryCheckItem;
