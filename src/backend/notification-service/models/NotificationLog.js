const crypto = require('crypto');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NotificationLog = sequelize.define('NotificationLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => crypto.randomUUID(),
    primaryKey: true
  },
  recipientId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "User ID, 'role:<Role Name>' for a role broadcast, or 'all'"
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  level: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'info',
    comment: 'UI severity: info | warning | success'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
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
