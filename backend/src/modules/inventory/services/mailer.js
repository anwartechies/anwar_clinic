// Sends OTP and invite codes by email (Gmail or any SMTP server). Configure SMTP_* in backend/.env.
const nodemailer = require('nodemailer');
const config = require('../config');

const enabled = () => !!(config.mail.user && config.mail.pass);
let transporter = null;
function transport() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.port === 465,
      auth: { user: config.mail.user, pass: config.mail.pass },
    });
  }
  return transporter;
}

function layout(title, intro, code, footer) {
  return `<!doctype html><html><body style="margin:0;background:#F2F4F9;font-family:Inter,Arial,sans-serif;color:#0A1633">
  <div style="max-width:480px;margin:0 auto;padding:24px">
    <div style="background:#0A1633;color:#fff;border-radius:20px 20px 0 0;padding:22px 24px">
      <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#14C79A;font-weight:700">${config.clinic.name}</div>
      <div style="font-size:22px;font-weight:800;margin-top:6px">${title}</div>
    </div>
    <div style="background:#fff;border-radius:0 0 20px 20px;padding:24px">
      <p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#3E4A6B">${intro}</p>
      <div style="font-size:34px;font-weight:800;letter-spacing:10px;text-align:center;background:#E7EBFF;color:#1B34C4;border-radius:14px;padding:16px 0">${code}</div>
      <p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#5D6785">${footer}</p>
    </div>
  </div></body></html>`;
}

async function send(to, subject, text, html) {
  if (!enabled() || !to) return false;
  await transport().sendMail({ from: config.mail.from, to, subject, text, html });
  return true;
}

function sendResetCode(user, code) {
  const mins = config.security.otpMinutes;
  return send(user.email, `${code} is your Nexgen password reset code`,
    `Your Nexgen Inventory password reset code is ${code}. It expires in ${mins} minutes. If you didn't ask for this, ignore this email.`,
    layout('Reset your password', `Hi ${user.name.split(' ')[0]}, use this code in the Nexgen app to reset your password.`, code, `The code expires in ${mins} minutes. If you didn't ask for a reset, you can ignore this email — your password stays the same.`));
}

function sendInviteCode(user, code, role) {
  return send(user.email, `You're invited to Nexgen Inventory`,
    `You've been invited as ${role}. Open the Nexgen app, tap "I have an invite", enter ${user.phone || user.email} and the code ${code}. The invite is valid for ${config.security.inviteDays} days.`,
    layout("You're invited", `You've been added to Nexgen Inventory as <b>${role}</b>. Open the app, tap <b>I have an invite</b>, enter your mobile number and this code.`, code, `The invite is valid for ${config.security.inviteDays} days.`));
}

// Run at start-up so a wrong Gmail App Password shows up in the console immediately.
async function verify() {
  if (!enabled()) return { ok: false, reason: 'not configured' };
  try { await transport().verify(); return { ok: true }; } catch (e) { return { ok: false, reason: e.message }; }
}

const maskEmail = (e = '') => { const [u, d] = e.split('@'); return d ? `${u.slice(0, 2)}${'•'.repeat(Math.max(1, u.length - 2))}@${d}` : e; };

module.exports = { enabled, sendResetCode, sendInviteCode, verify, maskEmail };
