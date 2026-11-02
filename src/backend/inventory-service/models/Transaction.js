const crypto = require('crypto');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => crypto.randomUUID(),
    primaryKey: true
  },
  borrowerId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'ID of the borrower user'
  },
  borrowerName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Display name of the borrower (denormalised for audit history)'
  },
  assetId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID of the borrowed asset'
  },
  assetName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Name of the borrowed asset (denormalised for audit history)'
  },
  reservationId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Associated reservation ID if created from a reservation'
  },
  releasedBy: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Logistics/Property Officer ID releasing the asset'
  },
  releasedByName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  releaseDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  expectedReturnDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  actualReturnDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  conditionAtRelease: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Good'
  },
  conditionAtReturn: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(
      'Pending',
      'Released',
      'Returned',
      'Overdue',
      'Cancelled'
    ),
    allowNull: false,
    defaultValue: 'Released'
  },
  digitalSignature: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Digital proof / cryptographic signature of handoff'
  },
  acknowledgementRef: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Reference code or receipt string for receipt confirmation'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'transactions',
  timestamps: true
});

module.exports = Transaction;
