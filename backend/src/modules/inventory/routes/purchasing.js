const router = require('express').Router();
const { Op } = require('sequelize');
const { Supplier, PurchaseOrder, PurchaseOrderItem, Product, Grn, GrnItem, Batch, User, sequelize } = require('../models');
const { can } = require('../middleware/auth');
const { badRequest, notFound, conflict, required, int, round2 } = require('../utils/http');
const { startOfDay, addDays, dateOnly } = require('../utils/time');
const { codes } = require('../services/sequence');
const stock = require('../services/stock');
const alerts = require('../services/alerts');
const approvals = require('../services/approvals');
const settings = require('../services/settings');
const audit = require('../services/audit');
const { notify } = require('../services/notify');
const { inr } = require('../utils/format');

const OPEN = ['approval', 'ordered', 'on_the_way'];
const rating = (pct) => (pct >= 95 ? 'Top' : pct >= 85 ? 'Good' : pct >= 75 ? 'Watch' : 'At risk');

// ---------- suppliers ----------
router.get('/suppliers', can('stock.view', 'supplier.manage', 'purchase.request'), async (req, res) => {
  const suppliers = await Supplier.findAll({
    where: req.query.all ? {} : { active: true },
    include: [{ model: PurchaseOrder, as: 'orders', required: false, where: { status: { [Op.in]: OPEN } } }],
    order: [['onTimePct', 'DESC']],
  });
  const list = suppliers.map((s) => {
    const json = s.toJSON();
    const orders = json.orders || [];
    delete json.orders;
    return { ...json, rating: rating(s.onTimePct), openPos: orders.length, openValue: orders.reduce((x, o) => x + o.total, 0) };
  });
  const worst = list.filter((s) => s.rating === 'At risk')[0];
  res.json({ items: list, insight: worst ? `${worst.name} is on time only ${worst.onTimePct}% of the time. Consider an alternate source for its items.` : null });
});

router.post('/suppliers', can('supplier.manage'), async (req, res) => {
  required(req.body, ['name']);
  const s = await Supplier.create(req.body);
  await audit.log({ user: req.user, category: 'stock', action: 'supplier.created', message: `added supplier ${s.name}` });
  res.status(201).json(s);
});

router.put('/suppliers/:id', can('supplier.manage'), async (req, res) => {
  const s = await Supplier.findByPk(req.params.id);
  if (!s) throw notFound('Supplier');
  await s.update(req.body);
  res.json(s);
});

// ---------- purchase orders ----------
const poInclude = [
  { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'city', 'phone', 'coldChain'] },
  { model: PurchaseOrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'unit', 'sku', 'coldChain'] }] },
  { model: User, as: 'creator', attributes: ['id', 'name'] },
];

function etaState(po) {
  if (!OPEN.includes(po.status) || !po.eta) return null;
  const sod = startOfDay();
  const eta = new Date(po.eta);
  if (eta < sod) return { tone: 'late', label: `${Math.ceil((sod - eta) / 86400000)} days late` };
  if (eta < addDays(sod, 1)) return { tone: 'today', label: po.status === 'on_the_way' ? `Arriving ${eta.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' })}` : 'Due today' };
  return { tone: 'ordered', label: `ETA ${eta.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', timeZone: 'Asia/Kolkata' })}` };
}

const summarise = (po) => {
  const items = po.items || [];
  const lines = items.length === 1 ? `${items[0].product.name} ×${items[0].qty}` : `${items.length} lines`;
  return { ...po.toJSON(), summary: lines, etaState: etaState(po) };
};

router.get('/purchase-orders', can('stock.view', 'purchase.request'), async (req, res) => {
  const tab = req.query.tab || 'open';
  const statusMap = { open: ['ordered', 'on_the_way'], approval: ['approval'], draft: ['draft'], closed: ['received', 'closed', 'rejected', 'cancelled'] };
  const pos = await PurchaseOrder.findAll({ where: { status: { [Op.in]: statusMap[tab] || statusMap.open } }, include: poInclude, order: [['eta', 'ASC'], ['id', 'DESC']] });
  const counts = {};
  for (const [k, v] of Object.entries(statusMap)) counts[k] = await PurchaseOrder.count({ where: { status: { [Op.in]: v } } });
  const open = await PurchaseOrder.findAll({ where: { status: { [Op.in]: statusMap.open } }, attributes: ['total'] });
  res.json({ items: pos.map(summarise), counts, openValue: open.reduce((s, p) => s + p.total, 0) });
});

router.get('/purchase-orders/:id', can('stock.view', 'purchase.request'), async (req, res) => {
  const po = await PurchaseOrder.findByPk(req.params.id, { include: [...poInclude, { model: Grn, as: 'grns' }] });
  if (!po) throw notFound('Purchase order');
  res.json(summarise(po));
});

async function submitPo(po, user, t) {
  const limit = await settings.get('poApprovalAbove');
  const perms = await require('../middleware/auth').permissionsFor(user.role);
  const needsApproval = po.total > limit && user.role !== 'super_admin' && !perms.includes('po.approve_high');
  if (needsApproval) {
    await po.update({ status: 'approval' }, { transaction: t });
    const items = await PurchaseOrderItem.findAll({ where: { poId: po.id }, include: [{ model: Product, as: 'product' }], transaction: t });
    const supplier = await Supplier.findByPk(po.supplierId, { transaction: t });
    await approvals.create({
      type: 'purchase', maker: user, valueImpact: po.total, refType: 'purchase_order', refId: po.id,
      reason: 'Below reorder level', title: 'Purchase request',
      subtitle: `${items.length === 1 ? `${items[0].product.name} ×${items[0].qty}` : `${items.length} lines`} · ${supplier.name}`,
      payload: { poNo: po.poNo }, transaction: t,
    });
  } else {
    await po.update({ status: 'ordered', placedAt: new Date(), approvedBy: user.id }, { transaction: t });
  }
  await audit.log({ user, category: 'stock', action: 'po.submitted', message: `${needsApproval ? 'raised purchase request' : 'placed'} ${po.poNo}`, detail: inr(po.total), transaction: t });
  return po;
}

async function createPo({ supplierId, items, eta, notes, submit }, user, t) {
  if (!items || !items.length) throw badRequest('Add at least one item');
  const products = await Product.findAll({ where: { id: { [Op.in]: items.map((i) => i.productId) } }, transaction: t });
  const lines = items.map((i) => {
    const p = products.find((x) => x.id === Number(i.productId));
    if (!p) throw badRequest(`Unknown product ${i.productId}`);
    return { productId: p.id, qty: int(i.qty), unitPrice: i.unitPrice !== undefined ? Number(i.unitPrice) : p.purchasePrice };
  });
  const supplier = await Supplier.findByPk(supplierId, { transaction: t });
  if (!supplier) throw badRequest('Choose a supplier');
  const total = round2(lines.reduce((s, l) => s + l.qty * l.unitPrice, 0));
  const po = await PurchaseOrder.create({
    poNo: await codes.po(t), supplierId, total, notes, createdBy: user.id, status: 'draft',
    eta: eta || addDays(new Date(), Math.ceil(Number(supplier.leadDays) || 3)),
  }, { transaction: t });
  await PurchaseOrderItem.bulkCreate(lines.map((l) => ({ ...l, poId: po.id })), { transaction: t });
  if (submit) await submitPo(po, user, t);
  return po;
}

router.post('/purchase-orders', can('purchase.request'), async (req, res) => {
  required(req.body, ['supplierId', 'items']);
  const po = await sequelize.transaction((t) => createPo(req.body, req.user, t));
  res.status(201).json(po);
});

// "Raise one request for all": one PO per preferred supplier for every low item not already on order.
router.post('/purchase-orders/from-low-stock', can('purchase.request'), async (req, res) => {
  const low = (await alerts.lowStock()).filter((l) => !l.openPo && (!req.body.productIds || req.body.productIds.includes(l.product.id)));
  if (!low.length) throw badRequest('Nothing to reorder — every low item is already on an open PO');
  const products = await Product.findAll({ where: { id: { [Op.in]: low.map((l) => l.product.id) } } });
  const fallback = await Supplier.findOne({ where: { active: true }, order: [['onTimePct', 'DESC']] });
  const bySupplier = {};
  products.forEach((p) => {
    const sid = p.preferredSupplierId || fallback.id;
    (bySupplier[sid] = bySupplier[sid] || []).push({ productId: p.id, qty: p.reorderQty, unitPrice: p.purchasePrice });
  });
  const created = await sequelize.transaction(async (t) => {
    const out = [];
    for (const [supplierId, items] of Object.entries(bySupplier)) out.push(await createPo({ supplierId, items, submit: true }, req.user, t));
    return out;
  });
  res.status(201).json({ created: created.map((p) => ({ id: p.id, poNo: p.poNo, status: p.status, total: p.total })) });
});

router.post('/purchase-orders/:id/submit', can('purchase.request'), async (req, res) => {
  const po = await PurchaseOrder.findByPk(req.params.id);
  if (!po) throw notFound('Purchase order');
  if (po.status !== 'draft') throw conflict('Only drafts can be submitted');
  await sequelize.transaction((t) => submitPo(po, req.user, t));
  res.json(po);
});

router.patch('/purchase-orders/:id', can('purchase.request'), async (req, res) => {
  const po = await PurchaseOrder.findByPk(req.params.id);
  if (!po) throw notFound('Purchase order');
  const patch = {};
  if (req.body.eta) patch.eta = req.body.eta;
  if (req.body.notes !== undefined) patch.notes = req.body.notes;
  if (req.body.status) {
    if (!['on_the_way', 'cancelled', 'closed'].includes(req.body.status)) throw badRequest('Invalid status');
    patch.status = req.body.status;
  }
  await po.update(patch);
  await audit.log({ user: req.user, category: 'stock', action: 'po.updated', message: `updated ${po.poNo}`, detail: Object.entries(patch).map(([k, v]) => `${k}: ${v}`).join(', ') });
  res.json(po);
});

// ---------- goods received notes ----------
const grnInclude = [
  { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
  { model: PurchaseOrder, as: 'po', attributes: ['id', 'poNo', 'total'] },
  { model: User, as: 'receiver', attributes: ['id', 'name'] },
  { model: GrnItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'unit', 'coldChain', 'sku'] }] },
];

function grnTotals(grn) {
  const items = grn.items || [];
  const receivedValue = round2(items.reduce((s, i) => s + i.receivedQty * i.unitCost, 0));
  const shortValue = round2(items.filter((i) => i.checked && i.receivedQty < i.orderedQty).reduce((s, i) => s + (i.orderedQty - i.receivedQty) * i.unitCost, 0));
  const shortUnits = items.filter((i) => i.checked).reduce((s, i) => s + Math.max(0, i.orderedQty - i.receivedQty), 0);
  return { checked: items.filter((i) => i.checked).length, lines: items.length, receivedValue, shortValue, shortUnits };
}

router.get('/grns', can('grn.receive', 'stock.view'), async (req, res) => {
  const where = req.query.status ? { status: req.query.status } : {};
  const grns = await Grn.findAll({ where, include: grnInclude, order: [['createdAt', 'DESC']], limit: 30 });
  res.json(grns.map((g) => ({ ...g.toJSON(), totals: grnTotals(g) })));
});

router.post('/purchase-orders/:id/grn', can('grn.receive'), async (req, res) => {
  const po = await PurchaseOrder.findByPk(req.params.id, { include: poInclude });
  if (!po) throw notFound('Purchase order');
  if (!['ordered', 'on_the_way'].includes(po.status)) throw conflict(`${po.poNo} is ${po.status} and can't be received`);
  const existing = await Grn.findOne({ where: { poId: po.id, status: 'draft' } });
  if (existing) return res.json({ id: existing.id });
  const grn = await sequelize.transaction(async (t) => {
    const g = await Grn.create({ grnNo: await codes.grn(t), poId: po.id, supplierId: po.supplierId, orderedValue: po.total, invoiceDate: dateOnly(), receivedBy: req.user.id }, { transaction: t });
    await GrnItem.bulkCreate(po.items.filter((i) => i.qty > i.receivedQty).map((i) => ({
      grnId: g.id, productId: i.productId, orderedQty: i.qty - i.receivedQty, receivedQty: 0, unitCost: i.unitPrice,
    })), { transaction: t });
    return g;
  });
  return res.status(201).json({ id: grn.id });
});

router.get('/grns/:id', can('grn.receive', 'stock.view'), async (req, res) => {
  const grn = await Grn.findByPk(req.params.id, { include: grnInclude, order: [[{ model: GrnItem, as: 'items' }, 'id', 'ASC']] });
  if (!grn) throw notFound('GRN');
  res.json({ ...grn.toJSON(), totals: grnTotals(grn) });
});

router.put('/grns/:id', can('grn.receive'), async (req, res) => {
  const grn = await Grn.findByPk(req.params.id, { include: grnInclude });
  if (!grn) throw notFound('GRN');
  if (grn.status !== 'draft') throw conflict('GRN already posted');
  await sequelize.transaction(async (t) => {
    await grn.update({ invoiceNo: req.body.invoiceNo ?? grn.invoiceNo, invoiceDate: req.body.invoiceDate ?? grn.invoiceDate, notes: req.body.notes ?? grn.notes }, { transaction: t });
    for (const line of req.body.items || []) {
      const item = grn.items.find((i) => i.id === Number(line.id));
      if (!item) continue;
      const patch = {};
      ['batchNo', 'expiryDate', 'tempC', 'checked'].forEach((k) => { if (line[k] !== undefined) patch[k] = line[k] === '' ? null : line[k]; });
      if (line.receivedQty !== undefined) patch.receivedQty = Math.max(0, int(line.receivedQty));
      if (line.unitCost !== undefined) patch.unitCost = Number(line.unitCost);
      await item.update(patch, { transaction: t });
    }
  });
  await grn.reload({ include: grnInclude });
  res.json({ ...grn.toJSON(), totals: grnTotals(grn) });
});

router.post('/grns/:id/post', can('grn.receive'), async (req, res) => {
  const result = await sequelize.transaction(async (t) => {
    const grn = await Grn.findByPk(req.params.id, { include: grnInclude, transaction: t });
    if (!grn) throw notFound('GRN');
    if (grn.status !== 'draft') throw conflict('GRN already posted');
    const lines = grn.items.filter((i) => i.receivedQty > 0);
    if (!lines.length) throw badRequest('Enter received quantity for at least one line');
    const problems = lines.filter((i) => !i.batchNo || !i.expiryDate).map((i) => i.product.name);
    if (problems.length) throw badRequest(`Batch and expiry are required for: ${problems.join(', ')}`);
    const expired = lines.filter((i) => i.expiryDate <= dateOnly()).map((i) => i.product.name);
    if (expired.length) throw badRequest(`Can't receive expired stock: ${expired.join(', ')}`);

    for (const line of lines) {
      const product = await Product.findByPk(line.productId, { transaction: t });
      let batch = await Batch.findOne({ where: { productId: line.productId, batchNo: line.batchNo }, transaction: t, lock: true });
      if (!batch) {
        batch = await Batch.create({
          productId: line.productId, supplierId: grn.supplierId, batchNo: line.batchNo, expiryDate: line.expiryDate, qty: 0,
          receivedQty: line.receivedQty, costPrice: line.unitCost, location: product.location, receivedAt: new Date(),
          barcode: `(01)${product.barcode || product.sku}(10)${line.batchNo}`,
        }, { transaction: t });
      } else {
        await batch.update({ receivedQty: batch.receivedQty + line.receivedQty }, { transaction: t });
      }
      await stock.applyMovement({ batch, qty: line.receivedQty, type: 'grn', user: req.user, refType: 'grn', refNo: grn.grnNo, note: grn.supplier.name, transaction: t });
      const poItem = await PurchaseOrderItem.findOne({ where: { poId: grn.poId, productId: line.productId }, transaction: t });
      if (poItem) await poItem.update({ receivedQty: poItem.receivedQty + line.receivedQty }, { transaction: t });
    }

    const totals = grnTotals(grn);
    await grn.update({ status: 'posted', postedAt: new Date(), receivedValue: totals.receivedValue, receivedBy: req.user.id,
      notes: totals.shortUnits ? `Short by ${totals.shortUnits} units (${inr(totals.shortValue)}) · logged against supplier` : grn.notes }, { transaction: t });
    const poItems = await PurchaseOrderItem.findAll({ where: { poId: grn.poId }, transaction: t });
    const complete = poItems.every((i) => i.receivedQty >= i.qty);
    await PurchaseOrder.update({ status: complete ? 'received' : 'on_the_way' }, { where: { id: grn.poId }, transaction: t });

    const units = lines.reduce((s, i) => s + i.receivedQty, 0);
    await audit.log({ user: req.user, category: 'stock', action: 'grn.posted', message: `received ${grn.grnNo}`, detail: `${grn.supplier.name} · ${lines.length} lines · +${units} units · ${inr(totals.receivedValue)}`, transaction: t });
    await notify({ roles: ['super_admin'], type: 'info', icon: 'truck', title: `${grn.grnNo} received`, body: `${grn.supplier.name} · +${units} units by ${req.user.name.split(' ')[0]}`, link: `grn:${grn.id}`, transaction: t });
    return { id: grn.id, grnNo: grn.grnNo, units, receivedValue: totals.receivedValue, poStatus: complete ? 'received' : 'partial' };
  });
  res.json(result);
});

module.exports = router;
