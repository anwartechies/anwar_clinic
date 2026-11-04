const router = require('express').Router();
const crypto = require('crypto');
const { Op } = require('sequelize');
const { Approval, User, Session, RolePermission, AuditLog, Notification, StockMovement, Batch, Product } = require('../models');
const { can, roles, clearPermCache } = require('../middleware/auth');
const { badRequest, notFound, forbidden, required, int } = require('../utils/http');
const { addDays, startOfDay } = require('../utils/time');
const approvalsSvc = require('../services/approvals');
const insights = require('../services/insights');
const settings = require('../services/settings');
const audit = require('../services/audit');
const { ROLES, ROLE_LABELS, PERMISSIONS } = require('../config/permissions');
const config = require('../config');
const { sha } = require('./auth');
const mailer = require('../services/mailer');

// ---------- dashboards ----------
router.get('/dashboard/admin', roles('super_admin'), async (req, res) => res.json(await insights.adminDashboard({ ...req.query, userId: req.user.id })));
router.get('/dashboard/manager', can('stock.view'), async (req, res) => res.json(await insights.managerHome(req.user)));
router.get('/analytics', can('reports.cost', 'reports.stock'), async (req, res) => res.json(await insights.analytics(req.query)));
router.get('/discrepancies', roles('super_admin'), async (req, res) => res.json(await insights.discrepancies(req.query)));

// ---------- approvals (checker side) ----------
router.get('/approvals', async (req, res) => {
  const where = {};
  const isChecker = req.user.role === 'super_admin';
  if (!isChecker) where.makerId = req.user.id;
  where.status = req.query.status === 'all' ? { [Op.ne]: null } : req.query.status || 'pending';
  const all = await Approval.findAll({ where, include: approvalsSvc.include, order: [['createdAt', 'DESC']], limit: 100 });
  const counts = { all: all.length };
  all.forEach((a) => { counts[a.type] = (counts[a.type] || 0) + 1; });
  const items = req.query.type && req.query.type !== 'all' ? all.filter((a) => a.type === req.query.type) : all;
  const oldest = all.filter((a) => a.status === 'pending').reduce((m, a) => (!m || a.createdAt < m ? a.createdAt : m), null);
  res.json({ items, counts, oldestHours: oldest ? Math.floor((Date.now() - oldest) / 3600000) : 0 });
});

router.get('/approvals/:id', async (req, res) => {
  const a = await Approval.findByPk(req.params.id, { include: approvalsSvc.include });
  if (!a) throw notFound('Approval');
  if (req.user.role !== 'super_admin' && a.makerId !== req.user.id) throw forbidden();
  let movements = [];
  let pattern = null;
  if (a.batchId) {
    movements = await StockMovement.findAll({
      where: { batchId: a.batchId, createdAt: { [Op.gte]: addDays(new Date(), -7) } },
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }], order: [['createdAt', 'DESC']], limit: 10,
    });
    const priorShortages = await Approval.count({ where: { batchId: a.batchId, type: 'adjustment', qtyChange: { [Op.lt]: 0 }, createdAt: { [Op.gte]: addDays(new Date(), -14) }, id: { [Op.ne]: a.id } } });
    const afterHours = movements.filter((m) => m.afterHours && m.type === 'dispense');
    if (priorShortages || afterHours.length) {
      const names = [...new Set(afterHours.map((m) => m.user && m.user.name))].filter(Boolean);
      pattern = [
        priorShortages ? `${priorShortages + 1}${priorShortages === 1 ? 'nd' : 'th'} shortage on this batch in 14 days.` : null,
        afterHours.length ? `${afterHours.length} issue${afterHours.length > 1 ? 's' : ''} by ${names.join(', ')} outside working hours.` : null,
      ].filter(Boolean).join(' ');
    }
  }
  res.json({ ...a.toJSON(), movements, pattern });
});

router.post('/approvals/:id/decision', roles('super_admin'), async (req, res) => {
  const { decision } = required(req.body, ['decision']);
  res.json(await approvalsSvc.decide(req.params.id, req.user, decision, req.body.note));
});

// ---------- staff ----------
router.get('/staff', can('staff.view'), async (req, res) => {
  const where = {};
  if (req.query.search) where[Op.or] = [{ name: { [Op.iLike]: `%${req.query.search}%` } }, { phone: { [Op.iLike]: `%${req.query.search}%` } }, { email: { [Op.iLike]: `%${req.query.search}%` } }];
  const users = await User.findAll({ where, order: [['status', 'ASC'], ['role', 'DESC'], ['name', 'ASC']] });
  const since = addDays(new Date(), -1);
  const flags = await Approval.findAll({ where: { createdAt: { [Op.gte]: since }, type: { [Op.in]: ['adjustment', 'wastage'] } }, attributes: ['makerId'] });
  const flagCount = flags.reduce((m, f) => ({ ...m, [f.makerId]: (m[f.makerId] || 0) + 1 }), {});
  const online = await Session.findAll({ where: { revokedAt: null, lastActiveAt: { [Op.gte]: new Date(Date.now() - 10 * 60000) } }, attributes: ['userId'] });
  const onlineSet = new Set(online.map((s) => s.userId));
  const order = { active: 0, invited: 1, inactive: 2 };
  const list = users.map((u) => ({
    ...u.toJSON(), initials: u.initials(), roleLabel: ROLE_LABELS[u.role], online: onlineSet.has(u.id), flags: flagCount[u.id] >= 3 ? 1 : 0, you: u.id === req.user.id,
  })).sort((a, b) => (b.you - a.you) || (order[a.status] - order[b.status]));
  res.json({
    items: list,
    counts: { total: users.length, active: users.filter((u) => u.status === 'active').length, invited: users.filter((u) => u.status === 'invited').length },
  });
});

const AVATARS = {
  inventory_manager: ['#EEE8FF', '#5530D9'], dispensing: ['#DDF7EE', '#03785B'], billing: ['#FFF2D4', '#8E5A00'], clinician: ['#FFE8E2', '#C93216'], super_admin: ['#0A1633', '#FFFFFF'],
};

function newInviteCode(user) {
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  user.inviteCodeHash = sha(code);
  user.inviteExpiresAt = addDays(new Date(), config.security.inviteDays);
  user.invitedAt = new Date();
  return code;
}

// Email the invite when SMTP is set up; otherwise (or on failure) print it so it can be passed on by hand.
async function deliverInvite(user, code) {
  let emailed = false;
  try { emailed = await mailer.sendInviteCode(user, code, ROLE_LABELS[user.role]); } catch (e) { console.error(`[MAIL] Could not email invite to ${user.email}: ${e.message}`); }
  if (!emailed) console.log(`\n[INVITE] Code for ${user.name} (${user.phone || user.email}): ${code}\n`);
  return { emailed, ...(process.env.NODE_ENV !== 'production' && !emailed ? { devInviteCode: code } : {}) };
}

router.post('/staff/invite', can('staff.manage'), async (req, res) => {
  const { name, phone, role } = required(req.body, ['name', 'phone', 'role']);
  if (!ROLES.includes(role) || role === 'super_admin') throw badRequest('Choose a valid role');
  const [bg, fg] = AVATARS[role];
  const user = User.build({
    name, phone, email: req.body.email ? req.body.email.toLowerCase() : null, role, status: 'invited', title: req.body.title,
    shiftOnly: req.body.shiftOnly ?? true, otpNewDevice: req.body.otpNewDevice ?? true, avatarBg: bg, avatarFg: fg,
  });
  const code = newInviteCode(user);
  await user.save();
  const delivery = await deliverInvite(user, code);
  await audit.log({ user: req.user, category: 'staff', action: 'staff.invited', message: `invited ${name}`, detail: `${ROLE_LABELS[role]}${delivery.emailed ? ' · emailed' : ''}` });
  res.status(201).json({ user, ...delivery });
});

router.post('/staff/:id/resend', can('staff.manage'), async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user || user.status !== 'invited') throw notFound('Pending invite');
  const code = newInviteCode(user);
  await user.save();
  const delivery = await deliverInvite(user, code);
  await audit.log({ user: req.user, category: 'staff', action: 'staff.invite_resent', message: `resent invite to ${user.name}` });
  res.json({ ok: true, ...delivery });
});

router.patch('/staff/:id', can('staff.manage'), async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw notFound('Staff member');
  if (user.id === req.user.id && req.body.status === 'inactive') throw badRequest("You can't deactivate yourself");
  const patch = {};
  ['name', 'phone', 'title', 'shiftOnly', 'shiftStart', 'shiftEnd', 'otpNewDevice'].forEach((k) => { if (req.body[k] !== undefined) patch[k] = req.body[k]; });
  if (req.body.role) {
    if (!ROLES.includes(req.body.role) || req.body.role === 'super_admin') throw badRequest('Invalid role');
    patch.role = req.body.role;
    [patch.avatarBg, patch.avatarFg] = AVATARS[req.body.role];
  }
  if (req.body.status === 'inactive') {
    patch.status = 'inactive';
    patch.deactivatedAt = new Date();
    await Session.update({ revokedAt: new Date() }, { where: { userId: user.id, revokedAt: null } });
  } else if (req.body.status === 'active' && user.status === 'inactive') {
    patch.status = 'active';
    patch.deactivatedAt = null;
  }
  await user.update(patch);
  await audit.log({ user: req.user, category: 'staff', action: 'staff.updated', message: `updated ${user.name}`, detail: Object.keys(patch).join(', ') });
  res.json(user);
});

router.get('/staff/:id/activity', can('staff.manage'), async (req, res) => {
  const rows = await AuditLog.findAll({ where: { userId: req.params.id }, order: [['createdAt', 'DESC']], limit: 40 });
  res.json(rows);
});

// ---------- roles & permissions ----------
router.get('/roles', can('staff.view'), async (req, res) => {
  const rows = await RolePermission.findAll();
  const members = await User.findAll({ where: { status: { [Op.ne]: 'inactive' } }, attributes: ['role'] });
  res.json({
    catalogue: PERMISSIONS,
    roles: ROLES.map((r) => ({
      role: r, label: ROLE_LABELS[r],
      members: members.filter((m) => m.role === r).length,
      permissions: (rows.find((x) => x.role === r) || { permissions: [] }).permissions,
      editable: r !== 'super_admin',
    })),
  });
});

router.put('/roles/:role', roles('super_admin'), async (req, res) => {
  const { role } = req.params;
  if (!ROLES.includes(role) || role === 'super_admin') throw badRequest('This role cannot be edited');
  const wanted = Array.isArray(req.body.permissions) ? req.body.permissions : [];
  const allowed = PERMISSIONS.filter((p) => !p.locked).map((p) => p.key);
  const perms = wanted.filter((p) => allowed.includes(p));
  await RolePermission.upsert({ role, permissions: perms });
  clearPermCache();
  await audit.log({ user: req.user, category: 'staff', action: 'role.updated', message: `updated permissions for ${ROLE_LABELS[role]}`, detail: `${perms.length} of ${PERMISSIONS.length} permissions` });
  res.json({ role, permissions: perms });
});

// ---------- audit log (append-only) ----------
router.get('/audit', can('audit.own', 'audit.all'), async (req, res) => {
  const where = {};
  const all = req.user.role === 'super_admin' || req.permissions.includes('audit.all');
  if (!all) where.userId = req.user.id;
  if (req.query.userId && all) where.userId = req.query.userId;
  if (req.query.category && req.query.category !== 'all') where.category = req.query.category;
  if (req.query.before) where.createdAt = { [Op.lt]: new Date(req.query.before) };
  const rows = await AuditLog.findAll({
    where, include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatarBg', 'avatarFg', 'role'] }],
    order: [['createdAt', 'DESC']], limit: int(req.query.limit, 60),
  });
  res.json(rows.map((r) => ({ ...r.toJSON(), you: r.userId === req.user.id })));
});

// ---------- notifications ----------
router.get('/notifications', async (req, res) => {
  const where = { userId: req.user.id };
  if (req.query.type && req.query.type !== 'all') where.type = req.query.type;
  const rows = await Notification.findAll({ where, order: [['createdAt', 'DESC']], limit: 60 });
  const unread = await Notification.count({ where: { userId: req.user.id, readAt: null } });
  const byType = await Notification.findAll({ where: { userId: req.user.id, readAt: null }, attributes: ['type'] });
  res.json({
    items: rows, unread,
    counts: byType.reduce((m, n) => ({ ...m, [n.type]: (m[n.type] || 0) + 1 }), {}),
    todayStart: startOfDay(),
  });
});

router.post('/notifications/read-all', async (req, res) => {
  await Notification.update({ readAt: new Date() }, { where: { userId: req.user.id, readAt: null } });
  res.json({ ok: true });
});

router.post('/notifications/:id/read', async (req, res) => {
  await Notification.update({ readAt: new Date() }, { where: { id: req.params.id, userId: req.user.id } });
  res.json({ ok: true });
});

// ---------- settings ----------
router.get('/settings', async (req, res) => res.json(await settings.getAll()));
router.put('/settings', can('settings.manage'), async (req, res) => {
  const updated = await settings.update(req.body);
  await audit.log({ user: req.user, category: 'system', action: 'settings.updated', message: 'changed settings', detail: Object.keys(req.body).join(', ') });
  res.json(updated);
});

// Batch lookup for pickers (adjustment, returns, write-offs).
router.get('/batches', can('stock.view'), async (req, res) => {
  const where = { qty: { [Op.gt]: 0 }, status: { [Op.ne]: 'written_off' } };
  if (req.query.productId) where.productId = req.query.productId;
  const include = [{ model: Product, as: 'product', attributes: ['id', 'name', 'unit', 'location'], where: req.query.search ? { name: { [Op.iLike]: `%${req.query.search}%` } } : undefined }];
  res.json(await Batch.findAll({ where, include, order: [['expiryDate', 'ASC']], limit: 40 }));
});

module.exports = router;
