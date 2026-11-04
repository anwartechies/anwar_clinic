const router = require('express').Router();
const { Op } = require('sequelize');
const { Product, Batch, StockMovement, Supplier, User, Prescription, PrescriptionItem, Approval, sequelize } = require('../models');
const { can } = require('../middleware/auth');
const { badRequest, notFound, required, int } = require('../utils/http');
const { dateOnly, daysUntil, addDays } = require('../utils/time');
const stock = require('../services/stock');
const alerts = require('../services/alerts');
const approvals = require('../services/approvals');
const settings = require('../services/settings');
const audit = require('../services/audit');
const { q } = require('../services/insights');

const PRODUCT_FIELDS = ['sku', 'name', 'type', 'category', 'unit', 'packInfo', 'brand', 'manufacturer', 'barcode', 'minLevel', 'reorderQty',
  'purchasePrice', 'sellingPrice', 'gstRate', 'rxRequired', 'coldChain', 'storage', 'location', 'status', 'preferredSupplierId'];
const pick = (body, fields) => Object.fromEntries(fields.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

// ---------- products ----------
router.get('/products', can('stock.view'), async (req, res) => {
  const { search, type, status = 'active', stockStatus } = req.query;
  const where = {};
  if (status !== 'all') where.status = status;
  if (type && type !== 'all') where.type = type;
  if (search) where[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }, { sku: { [Op.iLike]: `%${search}%` } }, { barcode: search }];
  let list = await stock.productsWithStock(where);
  if (stockStatus) list = list.filter((p) => p.stockStatus === stockStatus);
  const all = await Product.findAll({ where: { status: 'active' }, attributes: ['type'] });
  const byType = all.reduce((m, p) => ({ ...m, [p.type]: (m[p.type] || 0) + 1 }), {});
  const val = await stock.valuation();
  res.json({ items: list, counts: { all: all.length, ...byType }, totalValue: val.value });
});

router.get('/products/:id', can('stock.view'), async (req, res) => {
  const product = await Product.findByPk(req.params.id, { include: [{ model: Supplier, as: 'preferredSupplier', attributes: ['id', 'name'] }] });
  if (!product) throw notFound('Product');
  const batches = await Batch.findAll({
    where: { productId: product.id, qty: { [Op.gt]: 0 } },
    include: [{ model: Supplier, as: 'supplier', attributes: ['id', 'name'] }],
    order: [['expiryDate', 'ASC']],
  });
  const today = dateOnly();
  let nextMarked = false;
  const batchRows = batches.map((b) => {
    const usable = b.status === 'active' && b.expiryDate >= today;
    const next = usable && !nextMarked;
    if (next) nextMarked = true;
    return { ...b.toJSON(), daysLeft: daysUntil(b.expiryDate), usable, nextToDispense: next, expired: b.expiryDate < today };
  });
  const usable = batchRows.filter((b) => b.usable);
  const qty = usable.reduce((s, b) => s + b.qty, 0);
  const [usage] = await q(`SELECT COALESCE(SUM(ii.qty),0)::float AS units FROM invoice_items ii JOIN invoices i ON i.id=ii.invoice_id
                            WHERE ii.product_id=:id AND i.issued_at > :since`, { id: product.id, since: addDays(new Date(), -30) });
  const perDay = usage.units / 30;
  res.json({
    product,
    stock: qty,
    valueAtCost: usable.reduce((s, b) => s + b.qty * b.costPrice, 0),
    daysOfCover: perDay ? Math.round(qty / perDay) : null,
    batches: batchRows,
  });
});

router.get('/products/:id/movements', can('stock.view'), async (req, res) => {
  const rows = await StockMovement.findAll({
    where: { productId: req.params.id },
    include: [{ model: User, as: 'user', attributes: ['id', 'name'] }, { model: Batch, as: 'batch', attributes: ['id', 'batchNo'] }],
    order: [['createdAt', 'DESC']], limit: int(req.query.limit, 50),
  });
  res.json(rows);
});

router.post('/products', can('product.manage'), async (req, res) => {
  required(req.body, ['name', 'sku', 'unit']);
  const data = pick(req.body, PRODUCT_FIELDS);
  if (data.minLevel !== undefined && data.minLevel < 1) throw badRequest('Minimum level must be at least 1');
  const product = await Product.create({ gstRate: await settings.get('gstDefault'), ...data });
  await audit.log({ user: req.user, category: 'stock', action: 'product.created', message: `created product ${product.name}`, detail: product.sku });
  res.status(201).json(product);
});

router.put('/products/:id', can('product.manage'), async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) throw notFound('Product');
  await product.update(pick(req.body, PRODUCT_FIELDS));
  await audit.log({ user: req.user, category: 'stock', action: 'product.updated', message: `updated product ${product.name}`, detail: Object.keys(req.body).join(', ') });
  res.json(product);
});

router.patch('/batches/:id', can('product.manage'), async (req, res) => {
  const batch = await Batch.findByPk(req.params.id, { include: [{ model: Product, as: 'product' }] });
  if (!batch) throw notFound('Batch');
  const patch = pick(req.body, ['status', 'quarantineReason', 'location']);
  if (patch.status && !['active', 'quarantined'].includes(patch.status)) throw badRequest('Status must be active or quarantined');
  await batch.update(patch);
  await audit.log({ user: req.user, category: 'stock', action: 'batch.updated', message: `${patch.status === 'quarantined' ? 'quarantined' : 'updated'} batch ${batch.batchNo}`, detail: `${batch.product.name}${patch.quarantineReason ? ` · ${patch.quarantineReason}` : ''}` });
  res.json(batch);
});

// Barcode / QR / typed code lookup. Optionally checks the batch against a prescription.
router.get('/batches/scan', can('stock.view'), async (req, res) => {
  const code = String(req.query.code || '').trim();
  if (!code) throw badRequest('code is required');
  const batch = await Batch.findOne({
    where: { [Op.or]: [{ barcode: code }, { batchNo: { [Op.iLike]: code } }] },
    include: [{ model: Product, as: 'product' }],
    order: [['qty', 'DESC']],
  });
  if (!batch) {
    const product = await Product.findOne({ where: { [Op.or]: [{ barcode: code }, { sku: { [Op.iLike]: code } }] } });
    return res.json({ found: false, product });
  }
  let issuable = true;
  let blockedReason = null;
  try { stock.assertIssuable(batch); } catch (e) { issuable = false; blockedReason = e.message; }
  let match = null;
  if (req.query.rxId) {
    const rx = await Prescription.findByPk(req.query.rxId, { include: [{ model: PrescriptionItem, as: 'items' }] });
    const line = rx && rx.items.find((i) => i.productId === batch.productId);
    const fefo = (await stock.fefoBatches(batch.productId))[0];
    match = {
      rxNo: rx && rx.rxNo,
      onPickList: !!line,
      needed: line ? line.qty - line.dispensedQty : 0,
      isFefo: fefo ? fefo.id === batch.id : false,
      fefoBatchNo: fefo ? fefo.batchNo : null,
    };
  }
  if (!issuable) {
    await audit.log({ user: req.user, category: 'stock', action: 'dispense.blocked', message: 'Blocked issue of unusable batch', detail: `${batch.product.name} ${batch.batchNo} · ${blockedReason}`, flag: 'blocked' });
  }
  return res.json({ found: true, batch: { ...batch.toJSON(), daysLeft: daysUntil(batch.expiryDate) }, issuable, blockedReason, match });
});

// ---------- alerts ----------
router.get('/alerts', can('stock.view'), async (req, res) => {
  const [expiring, low, expired] = await Promise.all([alerts.expiring(int(req.query.window, 90)), alerts.lowStock(), alerts.expired()]);
  const group = (max, min) => expiring.filter((e) => e.daysLeft <= max && e.daysLeft > min);
  res.json({
    updatedAt: new Date(),
    expiring: {
      count: expiring.length,
      groups: [[7, -1], [30, 7], [60, 30], [90, 60]].map(([max, min]) => {
        const items = group(max, min);
        return { label: `Within ${max} days`, max, count: items.length, value: items.reduce((s, x) => s + x.value, 0), items };
      }),
    },
    low: { count: low.length, items: low },
    expired: { count: expired.length, value: expired.reduce((s, x) => s + x.value, 0), items: expired },
  });
});

// ---------- maker side of maker-checker ----------
const REASONS = {
  count_correction: 'Physical count mismatch', damage: 'Damaged', expired: 'Expired', transfer: 'Transfer',
  contaminated: 'Contaminated', dropped: 'Dropped', leaking: 'Leaking', other: 'Other',
};

router.post('/adjustments', can('adjustment.request'), async (req, res) => {
  const { batchId, reasonCode = 'count_correction', note } = required(req.body, ['batchId']);
  const batch = await Batch.findByPk(batchId, { include: [{ model: Product, as: 'product' }] });
  if (!batch) throw notFound('Batch');
  const qtyChange = req.body.actualQty !== undefined ? int(req.body.actualQty) - batch.qty : int(req.body.qtyChange);
  if (!qtyChange) throw badRequest('No change in quantity');
  const valueImpact = qtyChange * batch.costPrice;
  const threshold = await settings.get('adjustmentApprovalAbove');
  const payload = {
    type: 'adjustment', maker: req.user, productId: batch.productId, batchId: batch.id, qtyChange, systemQty: batch.qty, valueImpact,
    reasonCode, reason: req.body.reason || REASONS[reasonCode] || reasonCode, note,
    title: 'Stock adjustment', subtitle: `${batch.product.name} · ${qtyChange > 0 ? '+' : '−'}${Math.abs(qtyChange)} ${batch.product.unit}s`,
    payload: { photos: req.body.photos || [], secondCounter: req.body.secondCounter || null },
  };
  const result = await sequelize.transaction(async (t) => {
    if (threshold > 0 && Math.abs(valueImpact) <= threshold) {
      await stock.applyMovement({ batch, qty: qtyChange, type: 'adjustment', user: req.user, refType: 'adjustment', note, transaction: t });
      return { applied: true };
    }
    return approvals.create({ ...payload, transaction: t });
  });
  res.status(201).json(result);
});

router.post('/write-offs', can('adjustment.request'), async (req, res) => {
  const { batchIds } = required(req.body, ['batchIds']);
  const batches = await Batch.findAll({ where: { id: { [Op.in]: batchIds } }, include: [{ model: Product, as: 'product' }] });
  if (!batches.length) throw badRequest('No batches selected');
  const value = batches.reduce((s, b) => s + b.qty * b.costPrice, 0);
  const first = batches[0];
  const approval = await sequelize.transaction((t) => approvals.create({
    type: 'write_off', maker: req.user, productId: batches.length === 1 ? first.productId : null, batchId: batches.length === 1 ? first.id : null,
    qtyChange: -batches.reduce((s, b) => s + b.qty, 0), valueImpact: -value, reasonCode: 'expired', reason: req.body.reason || 'Expired stock',
    title: 'Expired write-off',
    subtitle: batches.length === 1 ? `${first.product.name} · ${first.qty} ${first.product.unit}s` : `${batches.length} expired batches`,
    payload: { batches: batches.map((b) => ({ batchId: b.id, batchNo: b.batchNo, product: b.product.name, qty: b.qty, value: b.qty * b.costPrice, expiryDate: b.expiryDate })) },
    transaction: t,
  }));
  res.status(201).json(approval);
});

// Dispensing-side returns: unused stock back to shelf (immediate) or wastage (needs approval).
router.post('/returns', can('return.request'), async (req, res) => {
  const { batchId, qty, mode = 'return' } = required(req.body, ['batchId', 'qty']);
  const batch = await Batch.findByPk(batchId, { include: [{ model: Product, as: 'product' }] });
  if (!batch) throw notFound('Batch');
  const n = int(qty);
  if (n <= 0) throw badRequest('Quantity must be more than 0');
  if (mode === 'return') {
    const mv = await sequelize.transaction(async (t) => {
      const m = await stock.applyMovement({ batch, qty: n, type: 'return', user: req.user, refType: 'rx', refNo: req.body.rxNo, note: req.body.note || 'Unused, back to shelf', transaction: t });
      await audit.log({ user: req.user, category: 'stock', action: 'stock.returned', message: `returned ${n} × ${batch.product.name}`, detail: `${batch.batchNo}${req.body.rxNo ? ` · ${req.body.rxNo}` : ''}`, transaction: t });
      return m;
    });
    return res.status(201).json({ restocked: true, movement: mv });
  }
  const reasonCode = req.body.reasonCode || 'damage';
  const approval = await sequelize.transaction((t) => approvals.create({
    type: 'wastage', maker: req.user, productId: batch.productId, batchId: batch.id, qtyChange: -n, systemQty: batch.qty,
    valueImpact: -n * batch.costPrice, reasonCode, reason: REASONS[reasonCode] || reasonCode, note: req.body.note,
    title: 'Wastage request', subtitle: `${batch.product.name} · ${n} ${batch.product.unit}s`,
    payload: { rxNo: req.body.rxNo, photos: req.body.photos || [] }, transaction: t,
  }));
  return res.status(201).json(approval);
});

router.get('/returns/mine', async (req, res) => {
  const wastage = await Approval.findAll({ where: { makerId: req.user.id, type: 'wastage' }, include: approvals.include, order: [['createdAt', 'DESC']], limit: 10 });
  const returns = await StockMovement.findAll({
    where: { userId: req.user.id, type: 'return' }, include: [{ model: Product, as: 'product', attributes: ['name', 'unit'] }],
    order: [['createdAt', 'DESC']], limit: 10,
  });
  const rows = [
    ...wastage.map((a) => ({ kind: 'wastage', id: `w${a.id}`, title: `Wastage · ${a.product ? a.product.name : ''} ×${Math.abs(a.qtyChange)}`, detail: a.reason, status: a.status, at: a.createdAt })),
    ...returns.map((m) => ({ kind: 'return', id: `r${m.id}`, title: `Return · ${m.product.name} ×${m.qty}`, detail: m.refNo || 'Back to shelf', status: 'restocked', at: m.createdAt })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at));
  res.json(rows.slice(0, 10));
});

module.exports = router;
