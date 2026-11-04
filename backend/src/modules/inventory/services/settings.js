const { Setting } = require('../models');

const DEFAULTS = {
  expiryWindows: [7, 30, 60, 90],
  varianceTolerancePct: 2,
  adjustmentApprovalAbove: 0,
  poApprovalAbove: 10000,
  refundApprovalAbove: 2000,
  afterHoursFlag: true,
  workingHours: { start: '08:00', end: '20:00' },
  gstDefault: 12,
  currency: 'INR',
  storageLocations: ['Main store', 'OT fridge (2–8 °C)'],
  weeklyReportEmail: { enabled: true, day: 'Monday', time: '08:00', to: 'nilesh@nexgenhair.in' },
  reverseWindowMinutes: 30,
};

async function getAll() {
  const rows = await Setting.findAll();
  const out = { ...DEFAULTS };
  rows.forEach((r) => { out[r.key] = r.value; });
  return out;
}

async function get(key) {
  const row = await Setting.findByPk(key);
  return row ? row.value : DEFAULTS[key];
}

async function update(patch) {
  const keys = Object.keys(patch).filter((k) => k in DEFAULTS);
  for (const key of keys) await Setting.upsert({ key, value: patch[key] });
  return getAll();
}

module.exports = { DEFAULTS, getAll, get, update };
