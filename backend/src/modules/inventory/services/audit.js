const { AuditLog } = require('../models');

// Append-only trail. `user` may be a User instance, an id, or null for system events.
async function log({ user, category, action, message, detail, flag, meta, ip, transaction, at }) {
  return AuditLog.create({
    userId: user && typeof user === 'object' ? user.id : user || null,
    category, action, message, detail, flag, meta: meta || {}, ip,
    ...(at ? { createdAt: at } : {}),
  }, { transaction });
}

module.exports = { log };
