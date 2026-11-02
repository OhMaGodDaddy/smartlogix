const crypto = require('crypto');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => crypto.randomUUID(),
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'ID of the user making the reservation request'
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Display name of the requester (denormalised for audit history)'
  },
  assetId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID of the requested asset'
  },
  assetName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Name of the requested asset (denormalised for audit history)'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  purpose: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(
      'Pending',
      'Approved',
      'Rejected',
      'Cancelled',
      'Completed'
    ),
    allowNull: false,
    defaultValue: 'Pending'
  },
  approverId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ID of the user who approved or rejected the request'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'reservations',
  timestamps: true
});

module.exports = Reservation;
