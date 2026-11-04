// Pharmacy & inventory module: the former nexgen-inventory backend.
const bcrypt = require('bcryptjs');
const app = require('./app');
const config = require('./config');
const { sequelize, User, RolePermission } = require('./models');
const { ROLES, DEFAULT_ROLE_PERMISSIONS } = require('./config/permissions');
const alerts = require('./services/alerts');
const mailer = require('./services/mailer');

// Creates only what is missing. Never alters or drops existing tables.
async function prepareDatabase() {
  await sequelize.createSchema(config.db.schema, {}).catch((e) => { if (e.original?.code !== '42P06') throw e; });
  await sequelize.sync();
  for (const role of ROLES) {
    await RolePermission.findOrCreate({ where: { role }, defaults: { permissions: DEFAULT_ROLE_PERMISSIONS[role] } });
  }
  const email = (process.env.INVENTORY_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.INVENTORY_ADMIN_PASSWORD;
  if (email && password && !(await User.count())) {
    await User.create({ name: 'Super Admin', email, role: 'super_admin', title: 'Owner', passwordHash: await bcrypt.hash(password, 10) });
    console.log(`[Inventory] Created first Super Admin ${email}. Remove INVENTORY_ADMIN_PASSWORD from the env now.`);
  }
}

async function startInventory() {
  await prepareDatabase();
  const mail = await mailer.verify();
  console.log(`[Inventory] Email: ${mail.ok ? 'ok' : mail.reason}`);
  const sweep = () => alerts.runChecks().catch((e) => console.error('[Inventory] Alert sweep failed:', e.message));
  setTimeout(sweep, 5000);
  setInterval(sweep, 60 * 60 * 1000);
}

module.exports = { inventoryApp: app, startInventory };
