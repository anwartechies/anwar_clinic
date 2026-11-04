const { Op } = require('sequelize');
const { Batch, Product, PurchaseOrder, PurchaseOrderItem, Approval, Supplier } = require('../models');
const { dateOnly, addDays, daysUntil } = require('../utils/time');
const stock = require('./stock');
const { notify } = require('./notify');

const productAttrs = ['id', 'name', 'sku', 'unit', 'type', 'minLevel', 'reorderQty', 'purchasePrice', 'location'];

async function expiring(windowDays = 90) {
  const today = dateOnly();
  const rows = await Batch.findAll({
    where: { status: 'active', qty: { [Op.gt]: 0 }, expiryDate: { [Op.between]: [today, dateOnly(addDays(new Date(), windowDays))] } },
    include: [{ model: Product, as: 'product', attributes: productAttrs }],
    order: [['expiryDate', 'ASC']],
  });
  return rows.map((b) => {
    const daysLeft = daysUntil(b.expiryDate);
    return {
      batchId: b.id, batchNo: b.batchNo, expiryDate: b.expiryDate, qty: b.qty, location: b.location,
      product: b.product, daysLeft, value: b.qty * b.costPrice,
      action: daysLeft <= 7 && b.product.type === 'prp' ? 'Return' : 'Use first',
      bucket: daysLeft <= 7 ? 7 : daysLeft <= 30 ? 30 : daysLeft <= 60 ? 60 : 90,
    };
  });
}

async function expired() {
  const pending = await Approval.findAll({ where: { type: 'write_off', status: 'pending' } });
  const pendingBatchIds = new Set(pending.flatMap((a) => (a.payload.batches || []).map((x) => x.batchId)));
  const rows = await Batch.findAll({
    where: { status: 'active', qty: { [Op.gt]: 0 }, expiryDate: { [Op.lt]: dateOnly() } },
    include: [{ model: Product, as: 'product', attributes: productAttrs }],
    order: [['expiryDate', 'DESC']],
  });
  return rows.map((b) => ({
    batchId: b.id, batchNo: b.batchNo, expiryDate: b.expiryDate, qty: b.qty, product: b.product,
    value: b.qty * b.costPrice, writeOffPending: pendingBatchIds.has(b.id),
  }));
}

async function lowStock() {
  const products = await Product.findAll({ where: { status: 'active' }, attributes: productAttrs });
  const levels = await stock.stockByProduct();
  const openItems = await PurchaseOrderItem.findAll({
    include: [{ model: PurchaseOrder, where: { status: { [Op.in]: ['approval', 'ordered', 'on_the_way'] } }, attributes: ['id', 'poNo', 'status', 'eta'] }],
  });
  const onOrder = {};
  openItems.forEach((i) => { onOrder[i.productId] = i.PurchaseOrder; });
  return products
    .map((p) => ({ product: p, stock: levels[p.id] || 0, minLevel: p.minLevel, openPo: onOrder[p.id] || null }))
    .filter((r) => r.stock < r.minLevel)
    .map((r) => ({ ...r, status: r.stock === 0 ? 'out' : r.openPo ? 'ordered' : 'low' }))
    .sort((a, b) => a.stock / a.minLevel - b.stock / b.minLevel);
}

async function quarantined() {
  return Batch.count({ where: { status: 'quarantined', qty: { [Op.gt]: 0 } } });
}

// Hourly sweep: raise critical notifications for ≤7-day expiries and stock below reorder level.
async function runChecks() {
  const today = dateOnly();
  for (const e of (await expiring(7))) {
    await notify({
      roles: ['super_admin', 'inventory_manager'], type: 'critical', icon: 'alert',
      title: `${e.product.name} expires in ${e.daysLeft} day${e.daysLeft === 1 ? '' : 's'}`,
      body: `${e.qty} ${e.product.unit}s · ${e.batchNo} · move to front`, link: `product:${e.product.id}`,
      dedupeKey: `exp:${e.batchId}:${today}`,
    });
  }
  for (const l of (await lowStock())) {
    await notify({
      roles: ['super_admin', 'inventory_manager'], type: l.status === 'out' ? 'critical' : 'info', icon: 'box',
      title: l.status === 'out' ? `${l.product.name} is out of stock` : `${l.product.name} below reorder level`,
      body: `${l.stock} left · reorder at ${l.minLevel}${l.openPo ? ` · on ${l.openPo.poNo}` : ''}`, link: `product:${l.product.id}`,
      dedupeKey: `low:${l.product.id}:${today}`,
    });
  }
}

module.exports = { expiring, expired, lowStock, quarantined, runChecks };
