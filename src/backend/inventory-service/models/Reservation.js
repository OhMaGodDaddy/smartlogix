const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID of the user making the reservation request'
  },
  assetId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID of the requested asset'
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
    type: DataTypes.UUID,
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
