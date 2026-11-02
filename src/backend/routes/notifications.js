const express = require('express');
const { Op } = require('sequelize');
const { NotificationLog } = require('../notification-service/models');
const { UUID_RE, HttpError, asyncRoute, pickFields } = require('../lib/http');

const router = express.Router();

/** A user sees notifications addressed to them, to their role, or to everyone. */
function audienceFilter({ recipientId, role }) {
  const audience = ['all'];
  if (recipientId) audience.push(String(recipientId));
  if (role) audience.push(`role:${role}`);
  return { recipientId: { [Op.in]: audience } };
}

router.get('/logs', asyncRoute(async (req, res) => {
  const where = req.query.recipientId || req.query.role ? audienceFilter(req.query) : {};
  res.json(await NotificationLog.findAll({ where, order: [['createdAt', 'DESC']], limit: 100 }));
}));

router.post('/logs', asyncRoute(async (req, res) => {
  const data = pickFields(req.body, ['recipientId', 'type', 'event', 'title', 'message', 'level']);
  if (!data.recipientId) throw new HttpError(400, 'recipientId is required');
  if (!data.message) throw new HttpError(400, 'message is required');
  if (!data.event) data.event = data.title || 'Notification';
  if (!data.level) delete data.level;
  if (!data.type) delete data.type;
  res.status(201).json(await NotificationLog.create({ ...data, status: 'Sent', sentAt: new Date() }));
}));

router.post('/logs/read-all', asyncRoute(async (req, res) => {
  const [updated] = await NotificationLog.update(
    { isRead: true },
    { where: { ...audienceFilter(req.body), isRead: false } }
  );
  res.json({ updated });
}));

router.patch('/logs/:id/read', asyncRoute(async (req, res) => {
  const log = UUID_RE.test(req.params.id) ? await NotificationLog.findByPk(req.params.id) : null;
  if (!log) throw new HttpError(404, 'Notification not found');
  res.json(await log.update({ isRead: true }));
}));

module.exports = router;

