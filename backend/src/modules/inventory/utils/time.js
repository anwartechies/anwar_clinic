// All "business day" logic runs in clinic time (IST, UTC+05:30).
const IST_OFFSET_MIN = 330;
const DAY = 86400000;

const toIst = (d = new Date()) => new Date(new Date(d).getTime() + IST_OFFSET_MIN * 60000);

// Midnight IST of the given instant, returned as a real Date (UTC instant).
function startOfDay(d = new Date()) {
  const ist = toIst(d);
  const midnight = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
  return new Date(midnight - IST_OFFSET_MIN * 60000);
}

function startOfMonth(d = new Date(), offsetMonths = 0) {
  const ist = toIst(d);
  const first = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth() + offsetMonths, 1);
  return new Date(first - IST_OFFSET_MIN * 60000);
}

const addDays = (d, n) => new Date(new Date(d).getTime() + n * DAY);

// 'YYYY-MM-DD' in IST
const dateOnly = (d = new Date()) => toIst(d).toISOString().slice(0, 10);

// Whole days from today (IST) until a DATEONLY string or Date.
function daysUntil(date) {
  const target = new Date(`${typeof date === 'string' ? date : dateOnly(date)}T00:00:00Z`).getTime();
  const today = new Date(`${dateOnly()}T00:00:00Z`).getTime();
  return Math.round((target - today) / DAY);
}

function minutesOfDay(d = new Date()) {
  const ist = toIst(d);
  return ist.getUTCHours() * 60 + ist.getUTCMinutes();
}
const hhmmToMin = (s) => { const [h, m] = String(s).split(':').map(Number); return h * 60 + (m || 0); };

function isOutside(d, start, end) {
  const m = minutesOfDay(d);
  return m < hhmmToMin(start) || m >= hhmmToMin(end);
}

const istDow = (d = new Date()) => toIst(d).getUTCDay();

// Range presets used by dashboards: today | 7d | 30d | custom (from/to)
function rangeFromQuery(q = {}) {
  const now = new Date();
  if (q.from && q.to) return { from: new Date(q.from), to: addDays(startOfDay(new Date(q.to)), 1), key: 'custom' };
  const key = q.range || 'today';
  const days = { today: 1, '7d': 7, '30d': 30, week: 7, month: 30, quarter: 91, year: 365 }[key] || 1;
  return { from: addDays(startOfDay(now), -(days - 1)), to: now, key, days };
}

module.exports = { DAY, toIst, startOfDay, startOfMonth, addDays, dateOnly, daysUntil, minutesOfDay, hhmmToMin, isOutside, istDow, rangeFromQuery };
