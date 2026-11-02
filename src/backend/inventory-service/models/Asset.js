const crypto = require('crypto');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => crypto.randomUUID(),
    primaryKey: true
  },
  assetTag: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  currentHolderId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'User ID of current holder/borrower'
  },
  currentHolderName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(
      'Available',
      'Reserved',
      'Borrowed',
      'Returned',
      'Inspection',
      'Maintenance',
      'Lost',
      'Unavailable'
    ),
    allowNull: false,
    defaultValue: 'Available'
  },
  condition: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Good'
  },
  qrCodeRef: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Unique identifier or reference path for QR code'
  },
  acquisitionDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  acquisitionCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  tableName: 'assets',
  timestamps: true
});

module.exports = Asset;
