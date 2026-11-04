// Read-side aggregations for dashboards, discrepancies and analytics.
const { sequelize, ValuationSnapshot, Approval, Supplier, PurchaseOrder, User } = require('../models');
const { Op } = require('sequelize');
const { startOfDay, startOfMonth, addDays, dateOnly, rangeFromQuery, DAY } = require('../utils/time');
const stock = require('./stock');
const alerts = require('./alerts');
const approvalsSvc = require('./approvals');

const q = (sql, replacements = {}) => sequelize.query(sql, { replacements, type: sequelize.QueryTypes.SELECT });
const one = async (sql, r) => (await q(sql, r))[0] || {};
const TZ = "'Asia/Kolkata'";

async function snapshotValuation() {
  const v = await stock.valuation();
  await ValuationSnapshot.upsert({ date: dateOnly(), value: v.value, units: v.units });
  return v;
}

async function periodTotals(from, to) {
  const r = { from, to };
  const purchases = await one(`SELECT COALESCE(SUM(received_value),0)::float AS value, COUNT(*)::int AS n FROM grns WHERE status='posted' AND posted_at BETWEEN :from AND :to`, r);
  const dispensed = await one(`SELECT COALESCE(SUM(total_units),0)::int AS units, COUNT(DISTINCT prescription_id)::int AS rx FROM dispenses WHERE status='completed' AND created_at BETWEEN :from AND :to`, r);
  const sales = await one(`SELECT COALESCE(SUM(total),0)::float AS value, COUNT(*)::int AS n FROM invoices WHERE issued_at BETWEEN :from AND :to`, r);
  const returns = await one(`SELECT COALESCE(SUM(amount),0)::float AS value, COUNT(*)::int AS n FROM sale_returns WHERE status<>'rejected' AND created_at BETWEEN :from AND :to`, r);
  return { purchases, dispensed, sales, returns };
}

// Rule-based signals: count shortages, bursts of adjustments by one user, usage spikes.
async function signals() {
  const out = [];
  const shortages = await q(`
    SELECT DISTINCT ON (i.batch_id) p.name, b.location, i.system_qty, i.counted_qty, i.counted_at
      FROM stock_count_items i JOIN products p ON p.id=i.product_id LEFT JOIN batches b ON b.id=i.batch_id
     WHERE i.counted_qty < i.system_qty AND i.resolution <> 'resolved' AND i.counted_at > :since
     ORDER BY i.batch_id, i.counted_at DESC`, { since: addDays(new Date(), -7) });
  shortages.sort((a, b) => (b.system_qty - b.counted_qty) - (a.system_qty - a.counted_qty)).slice(0, 3).forEach((s) => out.push({
    severity: 'high', kind: 'count_shortage',
    title: `${s.system_qty - s.counted_qty} units short in physical count`,
    detail: `${s.name} · ${s.location || 'store'}`, at: s.counted_at,
  }));

  const bursts = await q(`
    SELECT u.name, COUNT(*)::int AS n, STRING_AGG(DISTINCT split_part(p.name,' ',1), ' & ') AS items
      FROM approvals a JOIN users u ON u.id=a.maker_id LEFT JOIN products p ON p.id=a.product_id
     WHERE a.type IN ('adjustment','wastage') AND a.created_at > :since
     GROUP BY u.name HAVING COUNT(*) >= 3`, { since: addDays(new Date(), -1) });
  bursts.forEach((b) => out.push({ severity: 'medium', kind: 'adjustment_burst', title: `${b.n} adjustments in 24 h by one user`, detail: `${b.name} · ${b.items || ''}` }));

  const spikes = await q(`
    WITH recent AS (
      SELECT ii.product_id, SUM(ii.qty)::float AS q7 FROM invoice_items ii JOIN invoices i ON i.id=ii.invoice_id
       WHERE i.issued_at > :d7 GROUP BY ii.product_id),
    base AS (
      SELECT ii.product_id, SUM(ii.qty)::float/30*7 AS avg7 FROM invoice_items ii JOIN invoices i ON i.id=ii.invoice_id
       WHERE i.issued_at > :d37 AND i.issued_at <= :d7 GROUP BY ii.product_id)
    SELECT p.name, p.unit, r.q7, b.avg7, ROUND(((r.q7-b.avg7)/NULLIF(b.avg7,0))*100)::int AS pct
      FROM recent r JOIN base b USING(product_id) JOIN products p ON p.id=r.product_id
     WHERE b.avg7 >= 3 AND r.q7 > b.avg7*1.5 ORDER BY pct DESC LIMIT 2`,
  { d7: addDays(new Date(), -7), d37: addDays(new Date(), -37) });
  spikes.forEach((s) => out.push({ severity: 'info', kind: 'usage_spike', title: `Usage +${s.pct}% vs 30-day average`, detail: `${s.name} · ${Math.round(s.q7)} ${s.unit}s this week` }));
  return out;
}

async function adminDashboard(query) {
  const range = rangeFromQuery(query);
  const now = new Date();
  const v = await snapshotValuation();
  const past = await ValuationSnapshot.findOne({ where: { date: { [Op.lte]: dateOnly(addDays(now, -30)) } }, order: [['date', 'DESC']] });
  const spark = await ValuationSnapshot.findAll({ order: [['date', 'DESC']], limit: 12 });
  const productCounts = await one(`
    SELECT COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM batches b WHERE b.product_id=p.id AND b.qty>0 AND b.status='active'))::int AS active
      FROM products p WHERE p.status <> 'archived'`);

  const [low, expiring, expired, quarantinedCount] = await Promise.all([alerts.lowStock(), alerts.expiring(90), alerts.expired(), alerts.quarantined()]);
  const buckets = [7, 30, 60, 90].map((d) => ({ days: d, count: expiring.filter((e) => e.bucket === d).length }));

  const monthStart = startOfMonth(now);
  const losses = await one(`
    SELECT COALESCE(SUM(ABS(value_impact)) FILTER (WHERE status='approved' AND type IN ('write_off','wastage')),0)::float AS approved,
           COALESCE(SUM(ABS(value_impact)) FILTER (WHERE type='adjustment' AND reason_code='count_correction' AND qty_change<0 AND status<>'rejected'),0)::float AS unexplained
      FROM approvals WHERE created_at >= :from`, { from: monthStart });

  const pendingApprovals = await Approval.findAll({ where: { status: 'pending' }, include: approvalsSvc.include, order: [['createdAt', 'DESC']] });

  const spendSales = await q(`
    WITH m AS (SELECT generate_series(date_trunc('month', (now() AT TIME ZONE ${TZ})) - interval '5 months', date_trunc('month', (now() AT TIME ZONE ${TZ})), interval '1 month') AS month)
    SELECT to_char(m.month,'Mon') AS label, to_char(m.month,'YYYY-MM') AS key,
      COALESCE((SELECT SUM(received_value) FROM grns g WHERE g.status='posted' AND date_trunc('month', g.posted_at AT TIME ZONE ${TZ}) = m.month),0)::float AS spend,
      COALESCE((SELECT SUM(total) FROM invoices i WHERE date_trunc('month', i.issued_at AT TIME ZONE ${TZ}) = m.month),0)::float AS sales
    FROM m ORDER BY m.month`);

  const movers = await q(`
    SELECT p.id, p.name, COALESCE(SUM(ii.qty),0)::int AS units
      FROM products p
      LEFT JOIN invoice_items ii ON ii.product_id=p.id
       AND ii.invoice_id IN (SELECT id FROM invoices WHERE issued_at > :since)
     WHERE p.status='active' AND p.type IN ('medicine','prp','consumable','instrument')
     GROUP BY p.id, p.name ORDER BY units DESC, p.name`, { since: addDays(now, -30) });

  const staffActivity = await q(`
    SELECT u.id, u.name, u.role, u.avatar_bg AS "avatarBg", u.avatar_fg AS "avatarFg",
      (SELECT COUNT(DISTINCT d.prescription_id) FROM dispenses d WHERE d.user_id=u.id AND d.created_at >= :today)::int AS rx,
      (SELECT COALESCE(SUM(d.total_units),0) FROM dispenses d WHERE d.user_id=u.id AND d.created_at >= :today)::int AS units,
      (SELECT COUNT(*) FROM approvals a WHERE a.maker_id=u.id AND a.type IN ('adjustment','wastage') AND a.created_at >= :today)::int AS adjustments,
      (SELECT COUNT(*) FROM grns g WHERE g.received_by=u.id AND g.posted_at >= :today)::int AS grns,
      (SELECT COALESCE(SUM(gi.received_qty),0) FROM grn_items gi JOIN grns g ON g.id=gi.grn_id WHERE g.received_by=u.id AND g.posted_at >= :today)::int AS units_in
      FROM users u WHERE u.status='active' AND u.role IN ('dispensing','inventory_manager')
     ORDER BY u.role DESC, u.name`, { today: startOfDay(now) });

  const openPos = await one(`SELECT COUNT(*)::int AS n, COALESCE(SUM(total),0)::float AS value FROM purchase_orders WHERE status IN ('approval','ordered','on_the_way')`);
  const suppliers = await Supplier.findAll({ where: { active: true }, order: [['onTimePct', 'DESC']] });

  const me = await User.findByPk(query.userId);
  return {
    range: range.key,
    valuation: {
      value: v.value, units: v.units,
      changePct: past && past.value ? Math.round(((v.value - past.value) / past.value) * 1000) / 10 : 0,
      spark: spark.reverse().map((s) => s.value),
      totalSkus: productCounts.total, activeSkus: productCounts.active,
    },
    period: await periodTotals(range.from, range.to),
    stockHealth: {
      low: low.filter((l) => l.status !== 'out').length,
      out: low.filter((l) => l.status === 'out').length,
      expired: expired.length,
      quarantine: quarantinedCount,
      expiring: { count: expiring.length, value: expiring.reduce((s, e) => s + e.value, 0), buckets },
    },
    losses: { month: monthStart, approved: losses.approved, unexplained: losses.unexplained, total: losses.approved + losses.unexplained },
    approvals: { count: pendingApprovals.length, top: pendingApprovals.slice(0, 3) },
    signals: await signals(),
    spendVsSales: spendSales,
    fastMovers: movers.slice(0, 4),
    slowMovers: movers.slice(-4).reverse(),
    staffActivity: staffActivity.map((s) => ({ ...s, flagged: s.adjustments >= 3 })),
    suppliers: { openPos: openPos.n, openValue: openPos.value, list: suppliers },
    unreadNotifications: me ? await sequelize.models.Notification.count({ where: { userId: me.id, readAt: null } }) : 0,
  };
}

async function managerHome(user) {
  const now = new Date();
  const [low, expiring] = await Promise.all([alerts.lowStock(), alerts.expiring(7)]);
  const deliveries = await PurchaseOrder.findAll({
    where: { status: { [Op.in]: ['ordered', 'on_the_way'] } },
    include: [{ model: Supplier, as: 'supplier', attributes: ['id', 'name', 'coldChain'] }, { association: 'items', include: ['product'] }],
    order: [['eta', 'ASC']],
  });
  const endToday = addDays(startOfDay(now), 1);
  const dueToday = deliveries.filter((d) => d.eta && new Date(d.eta) < endToday);
  const nextCount = await sequelize.models.StockCount.findOne({ where: { status: { [Op.in]: ['scheduled', 'in_progress'] } }, order: [['scheduledAt', 'ASC']] });
  const myRequests = await Approval.findAll({ where: { makerId: user.id }, order: [['createdAt', 'DESC']], limit: 5, include: approvalsSvc.include });
  return {
    plan: { deliveriesDue: dueToday.length, nextCount },
    counts: { expiring7: expiring.length, low: low.filter((l) => l.status !== 'out').length, out: low.filter((l) => l.status === 'out').length },
    deliveries: deliveries.slice(0, 5).map((d) => ({ ...d.toJSON(), late: d.eta && new Date(d.eta) < startOfDay(now), today: d.eta && new Date(d.eta) < endToday })),
    myRequests,
  };
}

async function discrepancies(query) {
  const from = query.from ? new Date(query.from) : addDays(startOfDay(new Date()), -29);
  const to = query.to ? addDays(startOfDay(new Date(query.to)), 1) : new Date();
  const rows = await q(`
    SELECT i.id, p.id AS product_id, p.name, p.unit, b.id AS batch_id, b.batch_no, i.system_qty, i.counted_qty,
           (i.counted_qty - i.system_qty) AS variance, ((i.counted_qty - i.system_qty) * b.cost_price)::float AS value,
           i.resolution, i.counted_at, c.code AS count_code, a.code AS approval_code, a.status AS approval_status
      FROM stock_count_items i
      JOIN stock_counts c ON c.id=i.stock_count_id
      JOIN products p ON p.id=i.product_id
      LEFT JOIN batches b ON b.id=i.batch_id
      LEFT JOIN approvals a ON a.id=i.approval_id
     WHERE i.counted_qty IS NOT NULL AND i.counted_qty <> i.system_qty AND i.counted_at BETWEEN :from AND :to
     ORDER BY ABS((i.counted_qty - i.system_qty) * b.cost_price) DESC`, { from, to });

  // Spread each batch's variance across the people who handled that batch in the window.
  const byStaff = {};
  for (const r of rows.filter((x) => x.variance < 0)) {
    const handlers = await q(`SELECT DISTINCT user_id FROM stock_movements WHERE batch_id=:b AND created_at BETWEEN :from AND :to AND user_id IS NOT NULL`, { b: r.batch_id, from, to });
    handlers.forEach((h) => { byStaff[h.user_id] = (byStaff[h.user_id] || 0) + Math.abs(r.value) / handlers.length; });
  }
  const handlings = await q(`
    SELECT u.id, u.name, u.role, COUNT(m.id)::int AS handlings FROM users u
      JOIN stock_movements m ON m.user_id=u.id AND m.created_at BETWEEN :from AND :to
     GROUP BY u.id ORDER BY u.name`, { from, to });
  const staff = handlings.map((h) => ({ ...h, variance: Math.round(byStaff[h.id] || 0) })).filter((h) => h.variance > 0).sort((a, b) => b.variance - a.variance);

  const byDate = {};
  rows.forEach((r) => { const k = dateOnly(r.counted_at); byDate[k] = (byDate[k] || 0) + r.value; });

  const open = rows.filter((r) => r.resolution !== 'resolved');
  return {
    from, to,
    summary: {
      open: open.length,
      unexplained: Math.abs(open.filter((r) => r.value < 0).reduce((s, r) => s + r.value, 0)),
      resolved: rows.length - open.length,
    },
    products: rows,
    staff,
    dates: Object.entries(byDate).map(([date, value]) => ({ date, value })).sort((a, b) => a.date.localeCompare(b.date)),
  };
}

async function analytics(query) {
  const period = query.period || 'month';
  const now = new Date();
  const days = { week: 7, month: 30, quarter: 91, year: 365 }[period] || 30;
  const from = period === 'month' ? startOfMonth(now) : addDays(startOfDay(now), -(days - 1));
  const spanDays = Math.max(1, Math.ceil((now - from) / DAY));
  const prevFrom = addDays(from, -spanDays);
  const r = { from, to: now, prevFrom };

  const cur = await one(`
    SELECT COALESCE(SUM(ii.qty*ii.unit_price),0)::float AS net, COALESCE(SUM(ii.qty*ii.unit_cost),0)::float AS cogs
      FROM invoice_items ii JOIN invoices i ON i.id=ii.invoice_id WHERE i.issued_at BETWEEN :from AND :to`, r);
  const prev = await one(`
    SELECT COALESCE(SUM(ii.qty*ii.unit_price),0)::float AS net, COALESCE(SUM(ii.qty*ii.unit_cost),0)::float AS cogs
      FROM invoice_items ii JOIN invoices i ON i.id=ii.invoice_id WHERE i.issued_at BETWEEN :prevFrom AND :from`, r);
  const salesCur = await one(`SELECT COALESCE(SUM(total),0)::float AS v FROM invoices WHERE issued_at BETWEEN :from AND :to`, r);
  const salesPrev = await one(`SELECT COALESCE(SUM(total),0)::float AS v FROM invoices WHERE issued_at BETWEEN :prevFrom AND :from`, r);
  const waste = await one(`SELECT COALESCE(SUM(ABS(value_impact)),0)::float AS v FROM approvals WHERE status='approved' AND type IN ('write_off','wastage') AND decided_at BETWEEN :from AND :to`, r);
  const wastePrev = await one(`SELECT COALESCE(SUM(ABS(value_impact)),0)::float AS v FROM approvals WHERE status='approved' AND type IN ('write_off','wastage') AND decided_at BETWEEN :prevFrom AND :from`, r);
  const inv = await stock.valuation();

  const margin = cur.net ? ((cur.net - cur.cogs) / cur.net) * 100 : 0;
  const marginPrev = prev.net ? ((prev.net - prev.cogs) / prev.net) * 100 : 0;
  const wasteRate = cur.cogs + waste.v ? (waste.v / (cur.cogs + waste.v)) * 100 : 0;
  const wasteRatePrev = prev.cogs + wastePrev.v ? (wastePrev.v / (prev.cogs + wastePrev.v)) * 100 : 0;
  const dailyCogs = cur.cogs / spanDays;

  const daily = await q(`
    WITH d AS (SELECT generate_series(date_trunc('day', :from::timestamptz AT TIME ZONE ${TZ}), date_trunc('day', now() AT TIME ZONE ${TZ}), interval '1 day') AS day)
    SELECT to_char(d.day,'YYYY-MM-DD') AS date,
      COALESCE((SELECT SUM(total) FROM invoices i WHERE date_trunc('day', i.issued_at AT TIME ZONE ${TZ}) = d.day),0)::float AS sales
    FROM d ORDER BY d.day`, r);

  const spendByType = await q(`
    SELECT p.type, COALESCE(SUM(gi.received_qty*gi.unit_cost),0)::float AS value
      FROM grn_items gi JOIN grns g ON g.id=gi.grn_id JOIN products p ON p.id=gi.product_id
     WHERE g.status='posted' AND g.posted_at BETWEEN :from AND :to GROUP BY p.type ORDER BY value DESC`, r);
  const totalSpend = spendByType.reduce((s, x) => s + x.value, 0);

  const topItems = await q(`
    SELECT p.id, p.name, p.unit, SUM(ii.qty)::int AS units, SUM(ii.amount)::float AS revenue
      FROM invoice_items ii JOIN invoices i ON i.id=ii.invoice_id JOIN products p ON p.id=ii.product_id
     WHERE i.issued_at BETWEEN :from AND :to GROUP BY p.id ORDER BY revenue DESC LIMIT 5`, r);

  const fefo = await one(`
    SELECT COALESCE(SUM(di.qty*b.cost_price),0)::float AS v
      FROM dispense_items di JOIN dispenses d ON d.id=di.dispense_id JOIN batches b ON b.id=di.batch_id
     WHERE d.created_at BETWEEN :from AND :to AND b.expiry_date - (d.created_at AT TIME ZONE ${TZ})::date <= 30`, r);

  const reasons = await q(`
    SELECT COALESCE(reason_code,'other') AS reason, COALESCE(SUM(ABS(value_impact)),0)::float AS value
      FROM approvals WHERE status='approved' AND type IN ('write_off','wastage') AND decided_at > :since GROUP BY 1 ORDER BY value DESC`,
  { since: addDays(now, -180) });
  const reasonTotal = reasons.reduce((s, x) => s + x.value, 0);

  return {
    period, from,
    kpis: {
      grossMargin: { value: Math.round(margin * 10) / 10, delta: Math.round((margin - marginPrev) * 10) / 10 },
      wastageRate: { value: Math.round(wasteRate * 10) / 10, delta: Math.round((wasteRate - wasteRatePrev) * 10) / 10 },
      stockTurnover: { value: inv.value ? Math.round(((dailyCogs * 365) / inv.value) * 10) / 10 : 0 },
      daysOfCover: { value: dailyCogs ? Math.round(inv.value / dailyCogs) : 0 },
    },
    sales: { total: salesCur.v, changePct: salesPrev.v ? Math.round(((salesCur.v - salesPrev.v) / salesPrev.v) * 1000) / 10 : 0, daily },
    spendByType: spendByType.map((s) => ({ ...s, pct: totalSpend ? Math.round((s.value / totalSpend) * 100) : 0 })),
    topItems,
    fefoSaved: fefo.v,
    wastageReasons: reasons.map((x) => ({ ...x, pct: reasonTotal ? Math.round((x.value / reasonTotal) * 100) : 0 })),
  };
}

module.exports = { adminDashboard, managerHome, discrepancies, analytics, signals, periodTotals, snapshotValuation, q, one };
