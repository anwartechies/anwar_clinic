const router = require('express').Router();
const { ReportExport } = require('../models');
const { can } = require('../middleware/auth');
const { badRequest } = require('../utils/http');
const { startOfMonth, startOfDay, addDays, dateOnly, daysUntil } = require('../utils/time');
const insights = require('../services/insights');
const docs = require('../services/documents');
const settings = require('../services/settings');
const audit = require('../services/audit');

const { q } = insights;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : '');
const fmtTime = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });

const CATALOGUE = [
  { type: 'stock_valuation', label: 'Stock valuation', icon: 'rupee' },
  { type: 'expiry_register', label: 'Expiry register', icon: 'calendar' },
  { type: 'movement_ledger', label: 'Movement ledger', icon: 'list' },
  { type: 'discrepancies', label: 'Discrepancies', icon: 'flag' },
  { type: 'staff_activity', label: 'Staff activity', icon: 'users' },
  { type: 'gst_sales', label: 'GST sales', icon: 'receipt' },
];

const BUILDERS = {
  async stock_valuation({ groupBy }) {
    const key = { product: 'p.name, p.sku', category: 'p.type', batch: 'p.name, p.sku, b.batch_no, b.expiry_date' }[groupBy] || 'p.name, p.sku';
    const rows = await q(`
      SELECT ${key}, SUM(b.qty)::int AS qty, SUM(b.qty*b.cost_price)::float AS value, MIN(b.expiry_date) AS next_expiry
        FROM batches b JOIN products p ON p.id=b.product_id WHERE b.qty>0 AND b.status<>'written_off'
       GROUP BY ${key} ORDER BY value DESC`);
    const columns = groupBy === 'category'
      ? [{ key: 'type', label: 'Category', width: 2 }, { key: 'qty', label: 'Units' }, { key: 'value', label: 'Value at cost', money: true }]
      : [{ key: 'name', label: 'Product', width: 3 }, { key: 'sku', label: 'SKU' },
        ...(groupBy === 'batch' ? [{ key: 'batch_no', label: 'Batch' }, { key: 'expiry_date', label: 'Expiry' }] : [{ key: 'next_expiry', label: 'Next expiry' }]),
        { key: 'qty', label: 'Units' }, { key: 'value', label: 'Value at cost', money: true }];
    return { title: 'Stock valuation', columns, rows };
  },
  async expiry_register() {
    const rows = await q(`
      SELECT p.name, b.batch_no, b.expiry_date, b.qty, (b.qty*b.cost_price)::float AS value, b.location, b.status
        FROM batches b JOIN products p ON p.id=b.product_id
       WHERE b.qty>0 AND b.status<>'written_off' AND b.expiry_date <= :until ORDER BY b.expiry_date`, { until: dateOnly(addDays(new Date(), 90)) });
    rows.forEach((r) => { r.days = daysUntil(r.expiry_date); r.state = r.days < 0 ? 'Expired' : r.days <= 7 ? 'Critical' : r.days <= 30 ? 'Warning' : 'Watch'; });
    return {
      title: 'Expiry register',
      columns: [{ key: 'name', label: 'Product', width: 3 }, { key: 'batch_no', label: 'Batch' }, { key: 'expiry_date', label: 'Expiry' }, { key: 'days', label: 'Days left' },
        { key: 'qty', label: 'Qty' }, { key: 'location', label: 'Location' }, { key: 'state', label: 'Status' }, { key: 'value', label: 'Value', money: true }],
      rows,
    };
  },
  async movement_ledger({ from, to }) {
    const rows = await q(`
      SELECT m.created_at, m.type, p.name, b.batch_no, m.qty, m.balance_after, u.name AS user_name, m.ref_no, m.after_hours
        FROM stock_movements m JOIN products p ON p.id=m.product_id LEFT JOIN batches b ON b.id=m.batch_id LEFT JOIN users u ON u.id=m.user_id
       WHERE m.created_at BETWEEN :from AND :to ORDER BY m.created_at DESC`, { from, to });
    rows.forEach((r) => { r.when = fmtTime(r.created_at); r.flag = r.after_hours ? 'After hours' : ''; });
    return {
      title: 'Movement ledger',
      columns: [{ key: 'when', label: 'When', width: 1.4 }, { key: 'type', label: 'Type' }, { key: 'name', label: 'Product', width: 2.6 }, { key: 'batch_no', label: 'Batch' },
        { key: 'qty', label: 'Qty' }, { key: 'balance_after', label: 'Balance' }, { key: 'user_name', label: 'By', width: 1.4 }, { key: 'ref_no', label: 'Ref' }, { key: 'flag', label: 'Flag' }],
      rows,
    };
  },
  async discrepancies({ from, to }) {
    const d = await insights.discrepancies({ from, to });
    return {
      title: 'Discrepancy report',
      columns: [{ key: 'name', label: 'Product', width: 3 }, { key: 'batch_no', label: 'Batch' }, { key: 'count_code', label: 'Count' }, { key: 'system_qty', label: 'Expected' },
        { key: 'counted_qty', label: 'Counted' }, { key: 'variance', label: 'Variance' }, { key: 'value', label: 'Value', money: true }, { key: 'resolution', label: 'Status' }],
      rows: d.products,
    };
  },
  async staff_activity({ from, to }) {
    const rows = await q(`
      SELECT u.name, u.role,
        (SELECT COUNT(*) FROM audit_logs a WHERE a.user_id=u.id AND a.action='login.success' AND a.created_at BETWEEN :from AND :to)::int AS logins,
        (SELECT COUNT(*) FROM dispenses d WHERE d.user_id=u.id AND d.created_at BETWEEN :from AND :to)::int AS dispenses,
        (SELECT COALESCE(SUM(total_units),0) FROM dispenses d WHERE d.user_id=u.id AND d.status='completed' AND d.created_at BETWEEN :from AND :to)::int AS units,
        (SELECT COUNT(*) FROM approvals a WHERE a.maker_id=u.id AND a.created_at BETWEEN :from AND :to)::int AS requests,
        (SELECT COUNT(*) FROM invoices i WHERE i.created_by=u.id AND i.issued_at BETWEEN :from AND :to)::int AS invoices,
        (SELECT COUNT(*) FROM stock_movements m WHERE m.user_id=u.id AND m.after_hours AND m.created_at BETWEEN :from AND :to)::int AS after_hours
      FROM users u WHERE u.status <> 'invited' ORDER BY u.name`, { from, to });
    return {
      title: 'Staff activity',
      columns: [{ key: 'name', label: 'Staff', width: 2 }, { key: 'role', label: 'Role', width: 1.5 }, { key: 'logins', label: 'Sign-ins' }, { key: 'dispenses', label: 'Dispenses' },
        { key: 'units', label: 'Units' }, { key: 'requests', label: 'Requests' }, { key: 'invoices', label: 'Invoices' }, { key: 'after_hours', label: 'After-hours moves' }],
      rows,
    };
  },
  async gst_sales({ from, to }) {
    const rows = await q(`
      SELECT i.inv_no, i.issued_at, pt.name AS patient, i.subtotal::float, (i.gst_amount/2)::float AS cgst, (i.gst_amount/2)::float AS sgst, i.total::float, i.payment_method, i.status
        FROM invoices i LEFT JOIN patients pt ON pt.id=i.patient_id WHERE i.issued_at BETWEEN :from AND :to ORDER BY i.issued_at`, { from, to });
    rows.forEach((r) => { r.date = fmtDate(r.issued_at); });
    return {
      title: 'GST sales register',
      columns: [{ key: 'inv_no', label: 'Invoice' }, { key: 'date', label: 'Date' }, { key: 'patient', label: 'Patient', width: 2 }, { key: 'subtotal', label: 'Taxable', money: true },
        { key: 'cgst', label: 'CGST', money: true }, { key: 'sgst', label: 'SGST', money: true }, { key: 'total', label: 'Total', money: true }, { key: 'payment_method', label: 'Mode' }],
      rows,
    };
  },
};

router.get('/reports', can('reports.stock', 'reports.cost'), async (req, res) => {
  const recent = await ReportExport.findAll({ order: [['createdAt', 'DESC']], limit: 8 });
  res.json({ catalogue: CATALOGUE, recent, weeklyEmail: await settings.get('weeklyReportEmail') });
});

router.get('/reports/:type/export', can('reports.stock', 'reports.cost'), async (req, res) => {
  const builder = BUILDERS[req.params.type];
  if (!builder) throw badRequest('Unknown report');
  const format = ['pdf', 'xlsx', 'csv'].includes(req.query.format) ? req.query.format : 'pdf';
  const from = req.query.from ? startOfDay(new Date(req.query.from)) : startOfMonth();
  const to = req.query.to ? addDays(startOfDay(new Date(req.query.to)), 1) : new Date();
  const report = await builder({ from, to, groupBy: req.query.groupBy || 'product' });
  report.subtitle = `${fmtDate(from)} – ${fmtDate(addDays(to, -0.0001))} · generated ${fmtTime(new Date())} · ${report.rows.length} rows`;
  const buf = format === 'pdf' ? await docs.reportPdf(report) : format === 'xlsx' ? await docs.reportXlsx(report) : docs.reportCsv(report);
  const name = `${report.title} · ${fmtDate(new Date())}.${format}`;
  await ReportExport.create({ name, reportType: req.params.type, format, sizeBytes: buf.length, userId: req.user.id });
  await audit.log({ user: req.user, category: 'system', action: 'report.exported', message: `exported ${report.title}`, detail: `${format.toUpperCase()} · ${report.rows.length} rows` });
  const types = { pdf: 'application/pdf', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', csv: 'text/csv; charset=utf-8' };
  res.setHeader('Content-Type', types[format]);
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(name)}"`);
  res.send(buf);
});

module.exports = router;
