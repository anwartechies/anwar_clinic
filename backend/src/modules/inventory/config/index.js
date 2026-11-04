require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';
function secret(name, devValue) {
  if (process.env[name]) return process.env[name];
  if (isProd) throw new Error(`${name} must be set in production`);
  return devValue;
}

module.exports = {
  corsOrigin: process.env.INVENTORY_CORS_ORIGIN || (isProd ? '' : '*'),
  // Inventory's own database. The schema keeps its users, products and role_permissions
  // apart from the clinic's even if this ever points at the clinic database.
  db: { url: process.env.DATABASE_URL_INVENTORY || '', schema: 'inventory' },
  jwt: {
    accessSecret: secret('INVENTORY_JWT_SECRET', 'nexgen-dev-access-secret'),
    refreshSecret: secret('INVENTORY_JWT_REFRESH_SECRET', 'nexgen-dev-refresh-secret'),
    accessTtl: '15m',
    refreshDays: 7,
  },
  security: {
    maxFailedAttempts: 5,
    lockMinutes: 15,
    otpMinutes: 10,
    inviteDays: 7,
  },
  mail: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    user: process.env.SMTP_USER || '',
    pass: (process.env.SMTP_PASS || '').replace(/\s+/g, ''), // Gmail shows App Passwords with spaces
    from: process.env.MAIL_FROM || process.env.SMTP_USER || '',
  },
  clinic: {
    name: 'Nexgen Hair Clinic',
    city: 'Patna',
    gstin: '[CLINIC GSTIN]',
    timezone: 'Asia/Kolkata',
  },
};
