const router = require('express').Router();
const { Op } = require('sequelize');
const { StockCount, StockCountItem, Batch, Product, User, sequelize } = require('../models');
const { can } = require('../middleware/auth');
const { badRequest, notFound, conflict, int } = require('../utils/http');
const { codes } = require('../services/sequence');
const approvals = require('../services/approvals');
const audit = require('../services/audit');

const include = [
  { model: User, as: 'counter', attributes: ['id', 'name'] },
  { model: User, as: 'secondCounter', attributes: ['id', 'name'] },
];
const itemInclude = [
  { model: Product, as: 'product', attributes: ['id', 'name', 'unit', 'sku'] },
  { model: Batch, as: 'batch', attributes: ['id', 'batchNo', 'barcode', 'costPrice', 'expiryDate'] },
];

router.get('/stock-counts', can('count.perform', 'stock.view'), async (req, res) => {
  const counts = await StockCount.findAll({ include, order: [['createdAt', 'DESC']], limit: 20 });
  res.json(counts);
});

router.post('/stock-counts', can('count.perform'), async (req, res) => {
  const { area, locationPrefix, secondCounterId, scheduledAt, start = true } = req.body;
  if (!locationPrefix) throw badRequest('Choose a rack or location to count');
  const count = await sequelize.transaction(async (t) => {
    const c = await StockCount.create({
      code: await codes.count(t), area: area || locationPrefix, locationPrefix, counterId: req.user.id, secondCounterId: secondCounterId || null,
      status: start ? 'in_progress' : 'scheduled', scheduledAt: scheduledAt || new Date(), startedAt: start ? new Date() : null,
    }, { transaction: t });
    if (start) await snapshotItems(c, t);
    return c;
  });
  await audit.log({ user: req.user, category: 'stock', action: 'count.started', message: `started count ${count.code}`, detail: count.area });
  res.status(201).json(count);
});

async function snapshotItems(count, t) {
  const batches = await Batch.findAll({ where: { status: 'active', location: { [Op.iLike]: `${count.locationPrefix}%` } }, order: [['location', 'ASC']], transaction: t });
  if (!batches.length) throw badRequest(`No batches found in ${count.locationPrefix}`);
  await StockCountItem.bulkCreate(batches.map((b) => ({ stockCountId: count.id, productId: b.productId, batchId: b.id, location: b.location, systemQty: b.qty })), { transaction: t });
}

router.post('/stock-counts/:id/start', can('count.perform'), async (req, res) => {
  const count = await StockCount.findByPk(req.params.id);
  if (!count) throw notFound('Stock count');
  if (count.status !== 'scheduled') throw conflict('Count already started');
  await sequelize.transaction(async (t) => {
    await snapshotItems(count, t);
    await count.update({ status: 'in_progress', startedAt: new Date(), counterId: req.user.id }, { transaction: t });
  });
  res.json(count);
});

router.get('/stock-counts/:id', can('count.perform', 'stock.view'), async (req, res) => {
  const count = await StockCount.findByPk(req.params.id, { include: [...include, { model: StockCountItem, as: 'items', include: itemInclude }], order: [[{ model: StockCountItem, as: 'items' }, 'id', 'ASC']] });
  if (!count) throw notFound('Stock count');
  const blind = count.status === 'in_progress' && count.mode === 'blind' && req.user.role !== 'super_admin';
  const json = count.toJSON();
  json.items = json.items.map((i) => (blind ? { ...i, systemQty: null } : i));
  json.progress = { counted: json.items.filter((i) => i.countedQty !== null).length, total: json.items.length };
  res.json(json);
});

router.put('/stock-counts/:id/items/:itemId', can('count.perform'), async (req, res) => {
  const item = await StockCountItem.findOne({ where: { id: req.params.itemId, stockCountId: req.params.id }, include: [{ model: StockCount, as: 'count' }] });
  if (!item) throw notFound('Count line');
  if (item.count.status !== 'in_progress') throw conflict('This count is closed');
  const n = int(req.body.countedQty, -1);
  if (n < 0) throw badRequest('Enter a counted quantity of 0 or more');
  await item.update({ countedQty: n, countedAt: new Date(), recount: false });
  res.json({ id: item.id, countedQty: n });
});

router.post('/stock-counts/:id/scan', can('count.perform'), async (req, res) => {
  const code = String(req.body.code || '').trim();
  const items = await StockCountItem.findAll({ where: { stockCountId: req.params.id }, include: itemInclude });
  const hit = items.find((i) => i.batch && (i.batch.barcode === code || i.batch.batchNo.toLowerCase() === code.toLowerCase()));
  if (!hit) throw notFound('That batch is not part of this count');
  res.json({ itemId: hit.id });
});

router.post('/stock-counts/:id/finish', can('count.perform'), async (req, res) => {
  const count = await StockCount.findByPk(req.params.id, { include: [{ model: StockCountItem, as: 'items' }] });
  if (!count) throw notFound('Stock count');
  const left = count.items.filter((i) => i.countedQty === null).length;
  if (left) throw badRequest(`${left} lines still need a count`);
  await count.update({ status: 'completed', finishedAt: new Date() });
  await audit.log({ user: req.user, category: 'stock', action: 'count.finished', message: `finished count ${count.code}`, detail: `${count.items.length} lines` });
  res.json(count);
});

router.get('/stock-counts/:id/reconciliation', can('count.perform', 'stock.view'), async (req, res) => {
  const count = await StockCount.findByPk(req.params.id, { include: [...include, { model: StockCountItem, as: 'items', include: itemInclude }] });
  if (!count) throw notFound('Stock count');
  const lines = count.items.map((i) => {
    const variance = (i.countedQty ?? 0) - i.systemQty;
    return { ...i.toJSON(), variance, value: variance * (i.batch ? i.batch.costPrice : 0) };
  }).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const systemValue = lines.reduce((s, l) => s + l.systemQty * (l.batch ? l.batch.costPrice : 0), 0);
  const absVar = lines.reduce((s, l) => s + Math.abs(l.value), 0);
  res.json({
    count: { id: count.id, code: count.code, area: count.area, status: count.status, counter: count.counter, secondCounter: count.secondCounter },
    accuracy: systemValue ? Math.round((1 - absVar / systemValue) * 1000) / 10 : 100,
    matched: lines.filter((l) => l.variance === 0).length,
    variances: lines.filter((l) => l.variance !== 0).length,
    netVariance: lines.reduce((s, l) => s + l.value, 0),
    lines,
  });
});

router.post('/stock-counts/:id/recount', can('count.perform'), async (req, res) => {
  const ids = (req.body.itemIds || []).map(Number);
  const where = { stockCountId: req.params.id, ...(ids.length ? { id: { [Op.in]: ids } } : {}) };
  await StockCountItem.update({ recount: true, countedQty: null, countedAt: null, resolution: 'checking' }, { where });
  await StockCount.update({ status: 'in_progress', finishedAt: null }, { where: { id: req.params.id } });
  res.json({ ok: true });
});

// Turn every variance into a maker-checker adjustment request.
router.post('/stock-counts/:id/submit', can('count.perform', 'adjustment.request'), async (req, res) => {
  const out = await sequelize.transaction(async (t) => {
    const count = await StockCount.findByPk(req.params.id, { include: [...include, { model: StockCountItem, as: 'items', include: itemInclude }], transaction: t });
    if (!count) throw notFound('Stock count');
    if (count.status !== 'completed') throw conflict('Finish the count first');
    const created = [];
    for (const i of count.items.filter((x) => x.countedQty !== null && x.countedQty !== x.systemQty && !x.approvalId)) {
      const batch = await Batch.findByPk(i.batchId, { transaction: t });
      const qtyChange = i.countedQty - batch.qty;
      if (!qtyChange) continue;
      const a = await approvals.create({
        type: 'adjustment', maker: req.user, productId: i.productId, batchId: i.batchId, qtyChange, systemQty: batch.qty,
        valueImpact: qtyChange * batch.costPrice, reasonCode: 'count_correction', reason: 'Physical count mismatch',
        note: `Count ${count.code}${count.secondCounter ? ` · counted with ${count.secondCounter.name}` : ''}`,
        title: 'Stock adjustment', subtitle: `${i.product.name} · ${qtyChange > 0 ? '+' : '−'}${Math.abs(qtyChange)} ${i.product.unit}s`,
        payload: { countCode: count.code, countedAt: i.countedAt, secondCounter: count.secondCounter ? count.secondCounter.name : null },
        transaction: t,
      });
      await i.update({ approvalId: a.id }, { transaction: t });
      created.push(a.code);
    }
    await count.update({ status: 'submitted' }, { transaction: t });
    return created;
  });
  res.json({ approvals: out });
});

module.exports = router;
