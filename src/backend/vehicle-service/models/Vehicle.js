const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  plateNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Seating capacity or cargo weight limit in kg'
  },
  fleetStatus: {
    type: DataTypes.ENUM(
      'Available',
      'In Transit',
      'Maintenance',
      'Out of Service'
    ),
    allowNull: false,
    defaultValue: 'Available'
  },
  assignedDriverId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID of assigned Driver/Delivery Personnel'
  },
  lastServiceDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  nextMaintenanceDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  mileage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'vehicles',
  timestamps: true
});

module.exports = Vehicle;
