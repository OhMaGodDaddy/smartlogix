const { NotificationLog } = require('../notification-service/models');

const ROLES = {
  ADMIN: 'role:Administrator',
  OFFICER: 'role:Logistics/Property Officer',
  APPROVER: 'role:Approver'
};

/**
 * Records an in-app notification. Notification failures must never break the business
 * operation that triggered them, so errors are logged and swallowed.
 */
async function notify({ recipientId, title, message, level = 'info', event }) {
  try {
    await NotificationLog.create({
      recipientId,
      type: 'In-App',
      event: event || title,
      title,
      message,
      level,
      status: 'Sent',
      sentAt: new Date()
    });
  } catch (err) {
    console.error('[Notify] Failed to record notification:', err.message);
  }
}

module.exports = { notify, ROLES };

