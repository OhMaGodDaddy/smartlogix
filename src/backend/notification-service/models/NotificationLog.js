const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NotificationLog = sequelize.define('NotificationLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  recipientId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID of the targeted recipient user'
  },
  type: {
    type: DataTypes.ENUM('In-App', 'Email', 'SMS'),
    allowNull: false,
    defaultValue: 'In-App'
  },
  event: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Event key (e.g. Request Approval, Overdue Asset, Return Deadline)'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Sent', 'Failed'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'notification_logs',
  timestamps: true
});

module.exports = NotificationLog;
