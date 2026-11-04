const { Op } = require('sequelize');
const { Notification, User } = require('../models');

// Send a notification to specific users or every active user holding one of `roles`.
async function notify({ userIds = [], roles = [], type = 'info', icon, title, body, link, dedupeKey, transaction }) {
  let ids = [...userIds];
  if (roles.length) {
    const users = await User.findAll({ where: { role: { [Op.in]: roles }, status: 'active' }, attributes: ['id'], transaction });
    ids = ids.concat(users.map((u) => u.id));
  }
  ids = [...new Set(ids)];
  if (dedupeKey) {
    const existing = await Notification.findAll({ where: { dedupeKey, userId: { [Op.in]: ids } }, attributes: ['userId'], transaction });
    const skip = new Set(existing.map((n) => n.userId));
    ids = ids.filter((id) => !skip.has(id));
  }
  if (!ids.length) return [];
  return Notification.bulkCreate(ids.map((userId) => ({ userId, type, icon, title, body, link, dedupeKey })), { transaction });
}

module.exports = { notify };
