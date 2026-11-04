const router = require('express').Router();
const { Op } = require('sequelize');
const {
  Invoice, InvoiceItem, Payment, SaleReturn, SaleReturnItem, Prescription, PrescriptionItem, Patient, Dispense, DispenseItem, Product, Batch, User, sequelize,
} = require('../models');
const { can } = require('../middleware/auth');
const { badRequest, notFound, conflict, required, int, round2 } = require('../utils/http');
const { startOfDay, startOfMonth } = require('../utils/time');
const { codes } = require('../services/sequence');
const stock = require('../services/stock');
const billing = require('../services/billing');
const approvals = require('../services/approvals');
const settings = require('../services/settings');
const audit = require('../services/audit');
const docs = require('../services/documents');
const { inr } = require('../utils/format');

const invoiceInclude = [
  { model: Patient, as: 'patient' },
  { model: Prescription, as: 'prescription', attributes: ['id', 'rxNo', 'procedure'] },
  { model: Dispense, as: 'dispense', attributes: ['id', 'code'], include: [{ model: User, as: 'user', attributes: ['id', 'name'] }] },
  { model: User, as: 'creator', attributes: ['id', 'name'] },
  { model: InvoiceItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'unit', 'sku', 'rxRequired'] }, { model: Batch, as: 'batch', attributes: ['id', 'batchNo', 'expiryDate'] }] },
  { model: Payment, as: 'payments' },
  { model: SaleReturn, as: 'returns' },
];

// Lines that are dispensed for an Rx but not yet on an invoice.
async function unbilledLines(rx, t) {
  const dispenses = await Dispense.findAll({
    where: { prescriptionId: rx.id, status: 'completed' },
    include: [{ model: DispenseItem, as: 'items', include: [{ model: Product, as: 'product' }, { model: Batch, as: 'batch' }] }, { model: User, as: 'user', attributes: ['id', 'name'] }],
    order: [['createdAt', 'ASC']], transaction: t,
  });
  const billed = await Invoice.findAll({ where: { prescriptionId: rx.id }, attributes: ['dispenseId'], transaction: t });
  const billedIds = new Set(billed.map((b) => b.dispenseId));
  const open = dispenses.filter((d) => !billedIds.has(d.id));
  const lines = open.flatMap((d) => d.items.map((i) => ({
    productId: i.productId, batchId: i.batchId, qty: i.qty, unitPrice: i.product.sellingPrice, unitCost: i.batch.costPrice,
    gstRate: i.product.gstRate, product: i.product, batch: i.batch,
  })));
  return { lines, dispense: open[open.length - 1], dispenses: open };
}

router.get('/billing/home', can('invoice.view', 'invoice.create'), async (req, res) => {
  const sod = startOfDay();
  const payments = await Payment.findAll({ where: { createdAt: { [Op.gte]: sod } } });
  const collected = payments.reduce((s, p) => s + p.amount, 0);
  const mix = ['upi', 'cash', 'card', 'insurance'].map((m) => {
    const v = payments.filter((p) => p.method === m).reduce((s, p) => s + p.amount, 0);
    return { method: m, value: v, pct: collected ? Math.round((v / collected) * 100) : 0 };
  }).filter((m) => m.value > 0);
  const invoicesToday = await Invoice.count({ where: { issuedAt: { [Op.gte]: sod } } });
  const readyRx = await Prescription.findAll({ where: { status: { [Op.in]: ['dispensed', 'partial'] } }, include: [{ model: Patient, as: 'patient' }], order: [['updatedAt', 'DESC']] });
  const ready = [];
  for (const rx of readyRx) {
    const { lines, dispenses } = await unbilledLines(rx);
    if (!lines.length) continue;
    const last = dispenses[dispenses.length - 1];
    ready.push({ rx, dispensedBy: last.user, dispensedAt: last.createdAt, items: lines.length, total: billing.computeTotals(lines).total });
  }
  const awaiting = await Invoice.findAll({ where: { status: { [Op.in]: ['due', 'claim'] } }, include: [{ model: Patient, as: 'patient' }], order: [['issuedAt', 'DESC']] });
  res.json({ collected, invoicesToday, mix, ready, awaiting });
});

router.get('/billing/draft/:rxId', can('invoice.create'), async (req, res) => {
  const rx = await Prescription.findByPk(req.params.rxId, { include: [{ model: Patient, as: 'patient' }] });
  if (!rx) throw notFound('Prescription');
  const { lines, dispense } = await unbilledLines(rx);
  if (!lines.length) throw conflict(`Nothing left to bill on ${rx.rxNo}`);
  res.json({ rx, dispense: dispense && { id: dispense.id, code: dispense.code }, lines, totals: billing.computeTotals(lines) });
});

router.post('/invoices', can('invoice.create'), async (req, res) => {
  const { paymentMethod = 'upi', payments = [], extraItems = [] } = req.body;
  const inv = await sequelize.transaction(async (t) => {
    let rx = null;
    let lines = [];
    let dispense = null;
    let patientId = req.body.patientId;
    if (req.body.prescriptionId) {
      rx = await Prescription.findByPk(req.body.prescriptionId, { transaction: t, lock: true });
      if (!rx) throw notFound('Prescription');
      const u = await unbilledLines(rx, t);
      lines = u.lines;
      dispense = u.dispense;
      patientId = rx.patientId;
    }
    // Over-the-counter additions are issued FEFO at the counter.
    for (const extra of extraItems) {
      const product = await Product.findByPk(extra.productId, { transaction: t });
      if (!product) throw badRequest('Unknown product');
      if (product.rxRequired && !rx) throw badRequest(`${product.name} needs a prescription`);
      const { plan, shortfall } = await stock.fefoPlan(product.id, int(extra.qty), t);
      if (shortfall > 0) throw conflict(`Only ${int(extra.qty) - shortfall} ${product.unit}s of ${product.name} in stock`);
      for (const { batch, qty } of plan) {
        lines.push({ productId: product.id, batchId: batch.id, qty, unitPrice: product.sellingPrice, unitCost: batch.costPrice, gstRate: product.gstRate, sale: true, product });
      }
    }
    if (!lines.length) throw badRequest('Nothing to bill');
    if (!patientId) throw badRequest('Choose a patient');

    const totals = billing.computeTotals(lines);
    let paid = [];
    if (paymentMethod === 'insurance') paid = [];
    else if (paymentMethod === 'split') paid = payments.map((p) => ({ method: p.method, amount: round2(p.amount), ref: p.ref }));
    else paid = [{ method: paymentMethod, amount: req.body.amountPaid !== undefined ? round2(req.body.amountPaid) : totals.total, ref: req.body.paymentRef }];
    const paidAmount = round2(paid.reduce((s, p) => s + p.amount, 0));
    if (paidAmount > totals.total) throw badRequest('Paid amount is more than the total');

    const invoice = await Invoice.create({
      invNo: await codes.invoice(t), patientId, prescriptionId: rx ? rx.id : null, dispenseId: dispense ? dispense.id : null,
      ...totals, paidAmount, paymentMethod, paymentRef: req.body.paymentRef, createdBy: req.user.id, issuedAt: new Date(),
      status: paymentMethod === 'insurance' ? 'claim' : paidAmount >= totals.total ? 'paid' : 'due',
    }, { transaction: t });
    for (const l of lines) {
      if (l.sale) await stock.applyMovement({ batch: l.batchId, qty: -l.qty, type: 'sale', user: req.user, refType: 'invoice', refNo: invoice.invNo, transaction: t });
      await InvoiceItem.create({ invoiceId: invoice.id, productId: l.productId, batchId: l.batchId, qty: l.qty, unitPrice: l.unitPrice, unitCost: l.unitCost, gstRate: l.gstRate, amount: round2(l.qty * l.unitPrice) }, { transaction: t });
    }
    if (paid.length) await Payment.bulkCreate(paid.filter((p) => p.amount > 0).map((p) => ({ ...p, invoiceId: invoice.id, receivedBy: req.user.id })), { transaction: t });
    if (rx) {
      const items = await PrescriptionItem.findAll({ where: { prescriptionId: rx.id }, transaction: t });
      if (items.every((i) => i.dispensedQty >= i.qty || i.unavailable)) await rx.update({ status: 'billed' }, { transaction: t });
    }
    const patient = await Patient.findByPk(patientId, { transaction: t });
    await audit.log({ user: req.user, category: 'billing', action: 'invoice.created', message: `created invoice ${invoice.invNo}`, detail: `${patient.code} · ${inr(invoice.total)} · ${paymentMethod.toUpperCase()}`, transaction: t });
    return invoice;
  });
  const full = await Invoice.findByPk(inv.id, { include: invoiceInclude });
  res.status(201).json(full);
});

router.get('/invoices', can('invoice.view'), async (req, res) => {
  const tab = req.query.tab || 'all';
  const where = {};
  if (tab === 'paid') where.status = 'paid';
  if (tab === 'due') where.status = { [Op.in]: ['due', 'claim'] };
  if (tab === 'returned') where.status = { [Op.in]: ['part_return', 'returned'] };
  if (req.query.search) where.invNo = { [Op.iLike]: `%${req.query.search}%` };
  const rows = await Invoice.findAll({
    where, include: [{ model: Patient, as: 'patient' }, { model: InvoiceItem, as: 'items', attributes: ['id'] }],
    order: [['issuedAt', 'DESC']], limit: int(req.query.limit, 60),
  });
  const monthStart = startOfMonth();
  const month = await Invoice.findAll({ where: { issuedAt: { [Op.gte]: monthStart } }, attributes: ['total'] });
  const dueCount = await Invoice.count({ where: { status: { [Op.in]: ['due', 'claim'] } } });
  res.json({
    items: rows.map((r) => ({ ...r.toJSON(), itemCount: r.items.length, items: undefined })),
    month: { count: month.length, total: month.reduce((s, i) => s + i.total, 0) },
    dueCount,
  });
});

router.get('/invoices/:id', can('invoice.view'), async (req, res) => {
  const inv = await Invoice.findByPk(req.params.id, { include: invoiceInclude });
  if (!inv) throw notFound('Invoice');
  res.json(inv);
});

router.get('/invoices/:id/pdf', can('invoice.view'), async (req, res) => {
  const inv = await Invoice.findByPk(req.params.id, { include: invoiceInclude });
  if (!inv) throw notFound('Invoice');
  const buf = await docs.invoicePdf(inv);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${inv.invNo}.pdf"`);
  res.send(buf);
});

router.post('/invoices/:id/payments', can('payment.collect'), async (req, res) => {
  const { method, amount } = required(req.body, ['method', 'amount']);
  const out = await sequelize.transaction(async (t) => {
    const inv = await Invoice.findByPk(req.params.id, { transaction: t, lock: true });
    if (!inv) throw notFound('Invoice');
    const due = round2(inv.total - inv.paidAmount);
    if (due <= 0) throw conflict('Invoice is already paid');
    const amt = Math.min(round2(amount), due);
    await Payment.create({ invoiceId: inv.id, method, amount: amt, ref: req.body.ref, receivedBy: req.user.id }, { transaction: t });
    const paidAmount = round2(inv.paidAmount + amt);
    await inv.update({ paidAmount, status: paidAmount >= inv.total ? 'paid' : inv.status }, { transaction: t });
    await audit.log({ user: req.user, category: 'billing', action: 'payment.collected', message: `collected ${inr(amt)} on ${inv.invNo}`, detail: method.toUpperCase(), transaction: t });
    return inv;
  });
  res.json(out);
});

router.post('/invoices/:id/returns', can('sale_return.create'), async (req, res) => {
  const { items, reason, refundMethod } = required(req.body, ['items', 'reason', 'refundMethod']);
  const out = await sequelize.transaction(async (t) => {
    const inv = await Invoice.findByPk(req.params.id, { include: invoiceInclude, transaction: t });
    if (!inv) throw notFound('Invoice');
    const lines = items.filter((x) => int(x.qty) > 0).map((x) => {
      const it = inv.items.find((i) => i.id === Number(x.invoiceItemId));
      if (!it) throw badRequest('Item is not on this invoice');
      const qty = int(x.qty);
      if (qty > it.qty - it.returnedQty) throw badRequest(`Only ${it.qty - it.returnedQty} of ${it.product.name} can be returned`);
      return { it, qty, restock: x.restock !== false, amount: billing.lineRefund(it, qty) };
    });
    if (!lines.length) throw badRequest('Choose at least one item to return');
    const amount = lines.reduce((s, l) => s + l.amount, 0);
    const limit = await settings.get('refundApprovalAbove');
    const needsApproval = amount > limit && req.user.role !== 'super_admin';
    const sr = await SaleReturn.create({ code: await codes.creditNote(t), invoiceId: inv.id, reason, refundMethod, amount, createdBy: req.user.id, status: needsApproval ? 'pending_approval' : 'completed' }, { transaction: t });
    await SaleReturnItem.bulkCreate(lines.map((l) => ({ saleReturnId: sr.id, invoiceItemId: l.it.id, productId: l.it.productId, batchId: l.it.batchId, qty: l.qty, amount: l.amount, restock: l.restock })), { transaction: t });
    if (needsApproval) {
      await approvals.create({
        type: 'refund', maker: req.user, valueImpact: -amount, refType: 'sale_return', refId: sr.id, reason, title: 'Refund',
        subtitle: `${inv.invNo} · ${inv.patient.name} · ${inr(amount)}`, payload: { creditNote: sr.code, invNo: inv.invNo }, transaction: t,
      });
    } else {
      await billing.finalizeSaleReturn(sr, req.user, t);
    }
    return sr;
  });
  res.status(201).json(out);
});

router.get('/sale-returns', can('invoice.view'), async (req, res) => {
  const rows = await SaleReturn.findAll({
    include: [{ model: Invoice, as: 'invoice', attributes: ['id', 'invNo'], include: [{ model: Patient, as: 'patient', attributes: ['name', 'code'] }] }, { model: SaleReturnItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['name'] }] }],
    order: [['createdAt', 'DESC']], limit: 30,
  });
  res.json(rows);
});

module.exports = router;
