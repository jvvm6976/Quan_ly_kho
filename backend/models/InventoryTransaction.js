const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Product = require('./Product');
const User = require('./User');

const InventoryTransaction = sequelize.define('InventoryTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('in', 'out', 'adjustment'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  previousQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  newQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Define relationships
InventoryTransaction.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
InventoryTransaction.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
InventoryTransaction.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

module.exports = InventoryTransaction;
