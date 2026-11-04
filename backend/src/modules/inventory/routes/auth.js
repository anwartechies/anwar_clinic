const router = require('express').Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op, fn, col, where } = require('sequelize');
const config = require('../config');
const { User, Session, PasswordReset, AuditLog } = require('../models');
const { authenticate, permissionsFor } = require('../middleware/auth');
const { badRequest, unauthorized, forbidden, notFound, HttpError, required } = require('../utils/http');
const { isOutside, istDow, addDays } = require('../utils/time');
const { maskPhone } = require('../utils/format');
const audit = require('../services/audit');
const { notify } = require('../services/notify');
const mailer = require('../services/mailer');
const { ROLE_LABELS } = require('../config/permissions');

const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const isDev = process.env.NODE_ENV !== 'production';

function passwordProblems(pw) {
  const problems = [];
  if (!pw || pw.length < 10) problems.push('At least 10 characters');
  if (!/[a-z]/.test(pw || '') || !/[A-Z]/.test(pw || '') || !/\d/.test(pw || '') || !/[^A-Za-z0-9]/.test(pw || '')) problems.push('Upper & lower case, number and symbol');
  return problems;
}

async function findByIdentifier(identifier, scope = 'withSecrets') {
  const id = String(identifier || '').trim();
  if (!id) return null;
  const model = User.scope(scope);
  if (id.includes('@')) return model.findOne({ where: { email: id.toLowerCase() } });
  const digits = id.replace(/\D/g, '').slice(-10);
  if (digits.length < 10) return null;
  return model.findOne({ where: where(fn('right', fn('regexp_replace', col('phone'), '[^0-9]', '', 'g'), 10), digits) });
}

async function profile(user) {
  const json = user.toJSON();
  delete json.passwordHash; delete json.passwordHistory; delete json.inviteCodeHash;
  return { ...json, initials: user.initials(), roleLabel: ROLE_LABELS[user.role], permissions: await permissionsFor(user.role) };
}

// Which roles may sign in from each client. Super Admin uses both; everyone else is mobile-only.
const CLIENTS = {
  mobile: { label: 'Mobile app', roles: ['super_admin', 'inventory_manager', 'dispensing', 'billing', 'clinician'] },
  web: { label: 'Web browser', roles: ['super_admin'] },
};

function assertClientAllowed(client, user) {
  const c = CLIENTS[client];
  if (!c) throw badRequest('client must be "mobile" or "web"');
  if (!c.roles.includes(user.role)) {
    throw forbidden(client === 'web' ? 'The web console is for Super Admin only. Please use the mobile app.' : `${ROLE_LABELS[user.role]} accounts can't use the mobile app.`);
  }
}

async function issueTokens(user, session, remember = true, client = 'mobile') {
  const days = remember ? config.jwt.refreshDays : 1;
  const refreshToken = jwt.sign({ sub: user.id, sid: session.id, client, n: crypto.randomBytes(8).toString('hex') }, config.jwt.refreshSecret, { expiresIn: `${days}d` });
  session.refreshHash = sha(refreshToken);
  session.expiresAt = addDays(new Date(), days);
  session.lastActiveAt = new Date();
  await session.save();
  const accessToken = jwt.sign({ sub: user.id, sid: session.id, role: user.role, client }, config.jwt.accessSecret, { expiresIn: config.jwt.accessTtl });
  return { accessToken, refreshToken };
}

router.post('/login', async (req, res) => {
  const { identifier, password, remember = true, device = {}, client = 'mobile' } = required(req.body, ['identifier', 'password']);
  if (!CLIENTS[client]) throw badRequest('client must be "mobile" or "web"');
  const user = await findByIdentifier(identifier);
  if (!user) {
    await audit.log({ category: 'security', action: 'login.failed', message: 'Failed sign-in', detail: `Unknown account · ${String(identifier).slice(0, 4)}…`, ip: req.ip });
    throw unauthorized('Email/mobile or password is incorrect');
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const mins = Math.ceil((user.lockedUntil - Date.now()) / 60000);
    throw new HttpError(423, `Too many failed attempts. Try again in ${mins} min.`);
  }
  if (user.status === 'invited') throw forbidden('Your invite is pending. Use "I have an invite" to set your password.');
  if (user.status !== 'active') throw forbidden('This account has been deactivated');

  const ok = user.passwordHash && await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    user.failedAttempts += 1;
    if (user.failedAttempts >= config.security.maxFailedAttempts) {
      user.lockedUntil = new Date(Date.now() + config.security.lockMinutes * 60000);
      user.failedAttempts = 0;
    }
    await user.save();
    await audit.log({ user, category: 'security', action: 'login.failed', message: 'Failed sign-in', detail: `${device.name || 'Unknown device'} · ${user.email || user.phone}`, ip: req.ip });
    if (user.failedAttempts === 2 || user.lockedUntil) {
      await notify({ roles: ['super_admin'], type: 'critical', icon: 'shield', title: `Failed sign-in attempts · ${user.name}`, body: `${device.name || 'Unknown device'} · ${user.lockedUntil ? 'account locked 15 min' : '2 attempts'}`, link: 'security' });
    }
    if (user.lockedUntil) throw new HttpError(423, `Account locked for ${config.security.lockMinutes} minutes after 5 failed attempts`);
    throw unauthorized(`Email/mobile or password is incorrect · ${config.security.maxFailedAttempts - user.failedAttempts} attempts left`);
  }

  assertClientAllowed(client, user);
  if (user.shiftOnly && user.role !== 'super_admin') {
    if (!user.shiftDays.includes(istDow()) || isOutside(new Date(), user.shiftStart, user.shiftEnd)) {
      throw forbidden(`Your access is limited to shift hours (${user.shiftStart}–${user.shiftEnd})`);
    }
  }

  user.failedAttempts = 0;
  user.lockedUntil = null;
  user.lastSeenAt = new Date();
  await user.save();
  const platform = client === 'web' ? 'web' : ['android', 'ios', 'web'].includes(device.platform) ? device.platform : 'android';
  const session = await Session.create({ userId: user.id, deviceName: device.name || CLIENTS[client].label, platform, ip: req.ip });
  const tokens = await issueTokens(user, session, remember, client);
  await audit.log({ user, category: 'security', action: 'login.success', message: 'signed in', detail: session.deviceName, ip: req.ip });
  res.json({ ...tokens, user: await profile(user) });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = required(req.body, ['refreshToken']);
  let payload;
  try { payload = jwt.verify(refreshToken, config.jwt.refreshSecret); } catch { throw unauthorized('Session expired'); }
  const session = await Session.findByPk(payload.sid);
  if (!session || session.revokedAt || session.refreshHash !== sha(refreshToken)) throw unauthorized('Session ended');
  const user = await User.findByPk(payload.sub);
  if (!user || user.status !== 'active') throw unauthorized('Account is not active');
  // Re-check on every refresh: a role change or a mobile token used in the web console is caught here.
  const client = payload.client || 'mobile';
  assertClientAllowed(client, user);
  const tokens = await issueTokens(user, session, true, client);
  res.json({ ...tokens, user: await profile(user) });
});

router.post('/forgot', async (req, res) => {
  const { identifier } = required(req.body, ['identifier']);
  const user = await findByIdentifier(identifier);
  if (!user || user.status !== 'active') return res.json({ resetId: null, sentTo: 'your registered mobile' });
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  const reset = await PasswordReset.create({ userId: user.id, codeHash: sha(code), expiresAt: new Date(Date.now() + config.security.otpMinutes * 60000) });
  let emailed = false;
  try {
    emailed = await mailer.sendResetCode(user, code);
  } catch (e) {
    console.error(`[MAIL] Could not email reset code to ${user.email}: ${e.message}`);
  }
  if (!emailed) console.log(`\n[OTP] Password reset code for ${user.name} (${user.email || user.phone}): ${code}\n`);
  await audit.log({ user, category: 'security', action: 'password.reset_requested', message: 'requested a password reset', detail: emailed ? 'code emailed' : 'code not emailed', ip: req.ip });
  return res.json({
    resetId: reset.id,
    channel: emailed ? 'email' : 'console',
    sentTo: emailed ? mailer.maskEmail(user.email) : maskPhone(user.phone),
    // Only reveal the code when it couldn't be delivered, and never in production.
    ...(isDev && !emailed ? { devCode: code } : {}),
  });
});

async function loadReset(resetId, code) {
  const reset = await PasswordReset.findByPk(resetId);
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) throw badRequest('This code has expired. Request a new one.');
  if (reset.attempts >= 5) throw badRequest('Too many wrong codes. Request a new one.');
  if (reset.codeHash !== sha(String(code))) {
    reset.attempts += 1;
    await reset.save();
    throw badRequest('That code is not right');
  }
  return reset;
}

router.post('/forgot/verify', async (req, res) => {
  const { resetId, code } = required(req.body, ['resetId', 'code']);
  const reset = await loadReset(resetId, code);
  reset.verifiedAt = new Date();
  await reset.save();
  res.json({ verified: true });
});

router.post('/forgot/reset', async (req, res) => {
  const { resetId, code, password } = required(req.body, ['resetId', 'code', 'password']);
  const reset = await loadReset(resetId, code);
  const problems = passwordProblems(password);
  if (problems.length) throw badRequest(problems.join(' · '), { problems });
  const user = await User.scope('withSecrets').findByPk(reset.userId);
  const history = [user.passwordHash, ...(user.passwordHistory || [])].filter(Boolean).slice(0, 5);
  for (const h of history) if (await bcrypt.compare(password, h)) throw badRequest('Not one of your last 5 passwords');
  user.passwordHistory = history;
  user.passwordHash = await bcrypt.hash(password, 10);
  await user.save();
  reset.usedAt = new Date();
  await reset.save();
  await Session.update({ revokedAt: new Date() }, { where: { userId: user.id, revokedAt: null } });
  await audit.log({ user, category: 'security', action: 'password.reset', message: 'reset their password', detail: 'All devices signed out', ip: req.ip });
  res.json({ ok: true });
});

router.post('/invite/accept', async (req, res) => {
  const { identifier, code, password } = required(req.body, ['identifier', 'code', 'password']);
  const user = await findByIdentifier(identifier);
  if (!user || user.status !== 'invited') throw notFound('Pending invite');
  if (!user.inviteExpiresAt || user.inviteExpiresAt < new Date()) throw badRequest('This invite has expired. Ask your admin to resend it.');
  if (user.inviteCodeHash !== sha(String(code))) throw badRequest('Invite code is not right');
  const problems = passwordProblems(password);
  if (problems.length) throw badRequest(problems.join(' · '), { problems });
  user.passwordHash = await bcrypt.hash(password, 10);
  user.status = 'active';
  user.inviteCodeHash = null;
  await user.save();
  await audit.log({ user, category: 'staff', action: 'invite.accepted', message: 'accepted invite', detail: ROLE_LABELS[user.role] });
  await notify({ roles: ['super_admin'], type: 'info', icon: 'userplus', title: `${user.name} joined`, body: `${ROLE_LABELS[user.role]} · invite accepted`, link: `staff:${user.id}` });
  res.json({ ok: true });
});

// ---------- signed-in routes ----------
router.use(authenticate);

router.get('/me', async (req, res) => res.json(await profile(req.user)));

router.patch('/me/preferences', async (req, res) => {
  ['biometricUnlock', 'autoLock', 'twoStep'].forEach((k) => { if (typeof req.body[k] === 'boolean') req.user[k] = req.body[k]; });
  await req.user.save();
  res.json(await profile(req.user));
});

router.post('/logout', async (req, res) => {
  if (req.sessionId) await Session.update({ revokedAt: new Date() }, { where: { id: req.sessionId } });
  await audit.log({ user: req.user, category: 'security', action: 'logout', message: 'signed out' });
  res.json({ ok: true });
});

router.get('/sessions', async (req, res) => {
  const sessions = await Session.findAll({
    where: { userId: req.user.id, revokedAt: null, expiresAt: { [Op.gt]: new Date() } },
    attributes: { exclude: ['refreshHash'] },
    order: [['lastActiveAt', 'DESC']],
  });
  const alerts = await AuditLog.findAll({
    where: { userId: req.user.id, action: 'login.failed', createdAt: { [Op.gt]: addDays(new Date(), -7) } },
    order: [['createdAt', 'DESC']], limit: 5,
  });
  res.json({
    sessions: sessions.map((s) => ({ ...s.toJSON(), current: s.id === req.sessionId })),
    failedAttempts: alerts,
  });
});

router.delete('/sessions/:id', async (req, res) => {
  const session = await Session.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!session) throw notFound('Session');
  session.revokedAt = new Date();
  await session.save();
  await audit.log({ user: req.user, category: 'security', action: 'session.revoked', message: 'signed out a device', detail: session.deviceName });
  res.json({ ok: true });
});

router.post('/sessions/revoke-others', async (req, res) => {
  const [n] = await Session.update({ revokedAt: new Date() }, { where: { userId: req.user.id, revokedAt: null, id: { [Op.ne]: req.sessionId || null } } });
  await audit.log({ user: req.user, category: 'security', action: 'session.revoked_all', message: 'signed out all other devices', detail: `${n} sessions` });
  res.json({ revoked: n });
});

router.post('/security/ack', async (req, res) => {
  await audit.log({ user: req.user, category: 'security', action: 'security.acknowledged', message: 'confirmed failed sign-ins were theirs' });
  res.json({ ok: true });
});

// Short-lived token for opening PDF / Excel downloads in a browser or share sheet.
router.post('/download-token', async (req, res) => {
  const token = jwt.sign({ sub: req.user.id, scope: 'download' }, config.jwt.accessSecret, { expiresIn: '2m' });
  res.json({ token });
});

module.exports = router;
module.exports.passwordProblems = passwordProblems;
module.exports.sha = sha;
