// DEV ONLY. Drops the inventory schema (never public, which holds clinic data) and rebuilds it.
const config = require('../config');
const { sequelize } = require('../models');

(async () => {
  if (process.env.NODE_ENV === 'production' || config.db.url.includes('.rds.amazonaws.com')) {
    throw new Error('Refusing to reset inventory data on a production database');
  }
  await sequelize.query(`DROP SCHEMA IF EXISTS ${config.db.schema} CASCADE; CREATE SCHEMA ${config.db.schema};`);
  await sequelize.sync({ force: true });
  console.log('Inventory tables created');
})().catch((err) => { console.error(err); process.exitCode = 1; }).finally(() => sequelize.close());
