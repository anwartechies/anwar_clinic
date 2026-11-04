const jwt = require('jsonwebtoken');
const config = require('../config');
const { User, Session, RolePermission } = require('../models');
const { unauthorized, forbidden } = require('../utils/http');

const permCache = { at: 0, map: {} };
async function permissionsFor(role) {
  if (Date.now() - permCache.at > 30000) {
    const rows = await RolePermission.findAll();
    permCache.map = Object.fromEntries(rows.map((r) => [r.role, r.permissions]));
    permCache.at = Date.now();
  }
  return permCache.map[role] || [];
}
const clearPermCache = () => { permCache.at = 0; };

// Verifies the access token, the session it belongs to, and loads the user.
async function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.query.access_token;
  if (!token) return next(unauthorized());
  let payload;
  try {
    payload = jwt.verify(token, config.jwt.accessSecret);
  } catch {
    return next(unauthorized('Session expired'));
  }
  // Short-lived download links carry their own scope and skip session checks.
  if (payload.scope === 'download' && !req.path.match(/\/(pdf|download|export)/)) return next(unauthorized());
  const user = await User.findByPk(payload.sub);
  if (!user || user.status !== 'active') return next(unauthorized('Account is not active'));
  if (payload.sid) {
    const session = await Session.findByPk(payload.sid);
    if (!session || session.revokedAt) return next(unauthorized('Signed out from another device'));
    if (!session.lastActiveAt || Date.now() - session.lastActiveAt.getTime() > 60000) {
      session.lastActiveAt = new Date();
      await session.save();
      user.lastSeenAt = new Date();
      await user.save();
    }
    req.sessionId = session.id;
  }
  req.user = user;
  req.permissions = await permissionsFor(user.role);
  return next();
}

// Allow when the user's role holds ANY of the given permissions. Super Admin holds everything grantable.
const can = (...perms) => (req, _res, next) => {
  if (req.user.role === 'super_admin') return next();
  if (perms.some((p) => req.permissions.includes(p))) return next();
  return next(forbidden());
};

const roles = (...allowed) => (req, _res, next) => (allowed.includes(req.user.role) ? next() : next(forbidden()));

module.exports = { authenticate, can, roles, permissionsFor, clearPermCache };
