const { Op, fn, col } = require('sequelize');
const { Batch, Product, StockMovement, sequelize } = require('../models');
const { badRequest, conflict } = require('../utils/http');
const { dateOnly, isOutside } = require('../utils/time');
const settings = require('./settings');

// Every stock change goes through here so the ledger and batch qty never drift.
async function applyMovement({ batch, qty, type, user, refType, refNo, note, transaction, at }) {
  const b = batch instanceof Batch ? batch : await Batch.findByPk(batch, { transaction, lock: transaction ? true : undefined });
  if (!b) throw badRequest('Batch not found');
  const after = b.qty + qty;
  if (after < 0) throw conflict(`Only ${b.qty} left in batch ${b.batchNo}`);
  b.qty = after;
  if (type === 'write_off' && after === 0) b.status = 'written_off';
  await b.save({ transaction });

  const hours = await settings.get('workingHours');
  const when = at || new Date();
  return StockMovement.create({
    productId: b.productId, batchId: b.id, userId: user ? user.id || user : null,
    type, qty, balanceAfter: after, unitCost: b.costPrice, refType, refNo, note,
    afterHours: isOutside(when, hours.start, hours.end),
    ...(at ? { createdAt: at } : {}),
  }, { transaction });
}

// Batches that may be dispensed or sold, first-expiry-first-out.
function dispensableWhere(productId) {
  return {
    productId,
    status: 'active',
    qty: { [Op.gt]: 0 },
    expiryDate: { [Op.gte]: dateOnly() },
  };
}

async function fefoBatches(productId, transaction) {
  return Batch.findAll({ where: dispensableWhere(productId), order: [['expiryDate', 'ASC'], ['id', 'ASC']], transaction });
}

// Split a requested qty across FEFO batches. Returns [{batch, qty}] and the shortfall.
async function fefoPlan(productId, qty, transaction) {
  const batches = await fefoBatches(productId, transaction);
  const plan = [];
  let left = qty;
  for (const b of batches) {
    if (left <= 0) break;
    const take = Math.min(b.qty, left);
    plan.push({ batch: b, qty: take });
    left -= take;
  }
  return { plan, shortfall: left };
}

// Throw a readable error if a batch can't be issued right now.
function assertIssuable(batch) {
  if (batch.status === 'quarantined') throw conflict(`Batch ${batch.batchNo} is quarantined and blocked`);
  if (batch.status === 'written_off') throw conflict(`Batch ${batch.batchNo} has been written off`);
  if (batch.expiryDate < dateOnly()) throw conflict(`Batch ${batch.batchNo} expired on ${batch.expiryDate} and is blocked`);
}

// { productId: totalUsableQty } for the given (or all) products. Excludes expired/quarantined stock.
async function stockByProduct(productIds) {
  const where = { status: 'active', expiryDate: { [Op.gte]: dateOnly() } };
  if (productIds) where.productId = { [Op.in]: productIds };
  const rows = await Batch.findAll({ where, attributes: ['productId', [fn('SUM', col('qty')), 'qty']], group: ['productId'], raw: true });
  const map = {};
  rows.forEach((r) => { map[r.productId] = Number(r.qty) || 0; });
  return map;
}

async function valuation() {
  const [row] = await sequelize.query(
    `SELECT COALESCE(SUM(qty * cost_price),0)::float AS value, COALESCE(SUM(qty),0)::int AS units
       FROM batches WHERE status <> 'written_off' AND qty > 0`,
    { type: sequelize.QueryTypes.SELECT },
  );
  return row;
}

// Product list annotated with stock, batch count and status flags.
async function productsWithStock(where = {}) {
  const products = await Product.findAll({ where, order: [['name', 'ASC']], include: [{ model: Batch, as: 'batches', required: false }] });
  const today = dateOnly();
  return products.map((p) => {
    const usable = p.batches.filter((b) => b.status === 'active' && b.expiryDate >= today && b.qty > 0);
    const stock = usable.reduce((s, b) => s + b.qty, 0);
    const nearExpiry = usable.filter((b) => (new Date(b.expiryDate) - new Date(today)) / 86400000 <= 30).length;
    const json = p.toJSON();
    delete json.batches;
    return {
      ...json,
      stock,
      batchCount: usable.length,
      nearExpiryBatches: nearExpiry,
      value: usable.reduce((s, b) => s + b.qty * b.costPrice, 0),
      stockStatus: stock === 0 ? 'out' : stock < p.minLevel ? 'low' : 'ok',
    };
  });
}

module.exports = { applyMovement, fefoBatches, fefoPlan, assertIssuable, stockByProduct, valuation, productsWithStock, dispensableWhere };
