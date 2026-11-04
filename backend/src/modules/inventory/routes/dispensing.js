const router = require('express').Router();
const { Op } = require('sequelize');
const {
  Patient, Prescription, PrescriptionItem, Product, Batch, Dispense, DispenseItem, User, Invoice, StockCount, AuditLog, StockMovement, sequelize,
} = require('../models');
const { can } = require('../middleware/auth');
const { badRequest, notFound, conflict, forbidden, required, int } = require('../utils/http');
const { startOfDay, addDays, dateOnly, daysUntil, toIst } = require('../utils/time');
const { codes } = require('../services/sequence');
const stock = require('../services/stock');
const settings = require('../services/settings');
const audit = require('../services/audit');
const { notify } = require('../services/notify');

// ---------- patients ----------
router.get('/patients', can('rx.view', 'invoice.create', 'rx.create'), async (req, res) => {
  const s = req.query.search;
  const where = s ? { [Op.or]: [{ name: { [Op.iLike]: `%${s}%` } }, { code: { [Op.iLike]: `%${s}%` } }, { phone: { [Op.iLike]: `%${s}%` } }] } : {};
  res.json(await Patient.findAll({ where, order: [['updatedAt', 'DESC']], limit: 30 }));
});

router.post('/patients', can('rx.create', 'invoice.create'), async (req, res) => {
  required(req.body, ['name']);
  const p = await sequelize.transaction(async (t) => Patient.create({ code: await codes.patient(t), name: req.body.name, phone: req.body.phone, gender: req.body.gender, age: req.body.age }, { transaction: t }));
  res.status(201).json(p);
});

// ---------- prescriptions ----------
const rxInclude = [
  { model: Patient, as: 'patient' },
  { model: User, as: 'doctor', attributes: ['id', 'name'] },
  { model: PrescriptionItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'unit', 'sku', 'sellingPrice', 'location', 'coldChain'] }] },
];

const STATUS_TABS = {
  queue: ['pending', 'in_progress', 'partial'],
  pending: ['pending', 'in_progress'],
  partial: ['partial'],
  done: ['dispensed', 'billed'],
  all: ['pending', 'in_progress', 'partial', 'dispensed', 'billed', 'cancelled'],
};

router.get('/prescriptions', can('rx.view', 'rx.create'), async (req, res) => {
  const tab = req.query.status || 'queue';
  const where = { status: { [Op.in]: STATUS_TABS[tab] || STATUS_TABS.queue } };
  if (req.query.mine || req.user.role === 'clinician') where.doctorId = req.user.id;
  if (tab === 'done') {
    const todays = await Dispense.findAll({ where: { createdAt: { [Op.gte]: startOfDay() } }, attributes: ['prescriptionId'] });
    where.id = { [Op.in]: [...new Set(todays.map((d) => d.prescriptionId))] };
  }
  const rows = await Prescription.findAll({ where, include: rxInclude, order: [['priority', 'DESC'], ['createdAt', tab === 'queue' ? 'DESC' : 'DESC']], limit: 50 });
  res.json(rows);
});

router.post('/prescriptions', can('rx.create'), async (req, res) => {
  const { items } = required(req.body, ['items']);
  if (!items.length) throw badRequest('Add at least one medicine or item');
  const rx = await sequelize.transaction(async (t) => {
    let patientId = req.body.patientId;
    if (!patientId) {
      if (!req.body.patient || !req.body.patient.name) throw badRequest('Choose or add a patient');
      const p = await Patient.create({ code: await codes.patient(t), ...req.body.patient }, { transaction: t });
      patientId = p.id;
    }
    const r = await Prescription.create({
      rxNo: await codes.rx(t), patientId, doctorId: req.user.id, procedure: req.body.procedure, setting: req.body.setting || 'OPD',
      priority: req.body.priority || 'normal', notes: req.body.notes,
    }, { transaction: t });
    await PrescriptionItem.bulkCreate(items.map((i) => ({ prescriptionId: r.id, productId: i.productId, qty: int(i.qty), instructions: i.instructions })), { transaction: t });
    const patient = await Patient.findByPk(patientId, { transaction: t });
    await audit.log({ user: req.user, category: 'stock', action: 'rx.created', message: `wrote ${r.rxNo}`, detail: `${patient.code} · ${items.length} items`, transaction: t });
    await notify({ roles: ['dispensing'], type: r.priority === 'urgent' ? 'critical' : 'info', icon: 'pill', title: `New ${r.setting === 'OT' ? 'OT ' : ''}prescription ${r.rxNo}`, body: `${patient.code} · ${patient.name} · ${items.length} items`, link: `rx:${r.id}`, transaction: t });
    return r;
  });
  res.status(201).json(rx);
});

// Prescription with a FEFO pick list for every outstanding line.
router.get('/prescriptions/:id', can('rx.view', 'rx.create'), async (req, res) => {
  const rx = await Prescription.findByPk(req.params.id, { include: [...rxInclude, { model: Dispense, as: 'dispenses', include: [{ model: User, as: 'user', attributes: ['id', 'name'] }] }] });
  if (!rx) throw notFound('Prescription');
  const today = dateOnly();
  const pick = [];
  const blocked = [];
  for (const item of rx.items) {
    const remaining = item.qty - item.dispensedQty;
    const { plan, shortfall } = remaining > 0 ? await stock.fefoPlan(item.productId, remaining) : { plan: [], shortfall: 0 };
    pick.push({
      itemId: item.id, product: item.product, qty: item.qty, dispensedQty: item.dispensedQty, remaining, shortfall, unavailable: item.unavailable,
      batches: plan.map(({ batch, qty }) => ({ batchId: batch.id, batchNo: batch.batchNo, barcode: batch.barcode, expiryDate: batch.expiryDate, daysLeft: daysUntil(batch.expiryDate), location: batch.location, qty })),
    });
    if (remaining > 0) {
      const bad = await Batch.findAll({ where: { productId: item.productId, qty: { [Op.gt]: 0 }, [Op.or]: [{ expiryDate: { [Op.lt]: today } }, { status: 'quarantined' }] } });
      bad.forEach((b) => blocked.push({ product: item.product.name, batchNo: b.batchNo, expiryDate: b.expiryDate, reason: b.status === 'quarantined' ? 'quarantined' : 'expired' }));
    }
  }
  res.json({ ...rx.toJSON(), pick, blocked });
});

router.post('/prescriptions/:id/start', can('dispense.perform'), async (req, res) => {
  const rx = await Prescription.findByPk(req.params.id);
  if (!rx) throw notFound('Prescription');
  if (rx.status === 'pending') await rx.update({ status: 'in_progress' });
  res.json(rx);
});

router.post('/prescriptions/:id/dispense', can('dispense.perform'), async (req, res) => {
  const { lines = [], unavailable = [] } = req.body;
  const result = await sequelize.transaction(async (t) => {
    const rx = await Prescription.findByPk(req.params.id, { include: rxInclude, transaction: t, lock: { level: t.LOCK.UPDATE, of: Prescription } });
    if (!rx) throw notFound('Prescription');
    if (['dispensed', 'billed', 'cancelled'].includes(rx.status)) throw conflict(`${rx.rxNo} is already ${rx.status}`);
    if (!lines.length && !unavailable.length) throw badRequest('Nothing picked');

    const dispense = await Dispense.create({ code: await codes.dispense(t), prescriptionId: rx.id, userId: req.user.id }, { transaction: t });
    let units = 0;
    for (const line of lines) {
      const item = rx.items.find((i) => i.productId === Number(line.productId));
      if (!item) throw badRequest(`Product ${line.productId} is not on ${rx.rxNo}`);
      const qty = int(line.qty);
      if (qty <= 0) continue;
      if (item.dispensedQty + qty > item.qty) throw badRequest(`Only ${item.qty - item.dispensedQty} more ${item.product.name} needed`);
      const batch = await Batch.findByPk(line.batchId, { transaction: t, lock: true });
      if (!batch || batch.productId !== item.productId) throw badRequest(`Batch does not match ${item.product.name}`);
      try {
        stock.assertIssuable(batch);
      } catch (e) {
        await audit.log({ user: req.user, category: 'stock', action: 'dispense.blocked', message: 'Blocked dispensing of unusable batch', detail: `${item.product.name} ${batch.batchNo}`, flag: 'blocked' });
        throw e;
      }
      await stock.applyMovement({ batch, qty: -qty, type: 'dispense', user: req.user, refType: 'rx', refNo: rx.rxNo, transaction: t });
      await DispenseItem.create({ dispenseId: dispense.id, productId: item.productId, batchId: batch.id, qty }, { transaction: t });
      item.dispensedQty += qty;
      await item.save({ transaction: t });
      units += qty;
    }
    for (const pid of unavailable) {
      const item = rx.items.find((i) => i.productId === Number(pid));
      if (item) await item.update({ unavailable: true }, { transaction: t });
    }
    const complete = rx.items.every((i) => i.dispensedQty >= i.qty);
    await rx.update({ status: complete ? 'dispensed' : 'partial' }, { transaction: t });
    await dispense.update({ totalUnits: units }, { transaction: t });

    await audit.log({ user: req.user, category: 'stock', action: 'dispense.completed', message: `dispensed ${units} units for ${rx.rxNo}`, detail: `${rx.patient.code} · ${dispense.code}${complete ? '' : ' · partial'}`, transaction: t });
    if (units > 0) {
      await notify({ roles: ['billing'], type: 'info', icon: 'receipt', title: `Ready to bill · ${rx.rxNo}`, body: `${rx.patient.code} ${rx.patient.name} · dispensed by ${req.user.name.split(' ')[0]}`, link: `rx:${rx.id}`, transaction: t });
    }
    return { dispense, complete };
  });
  const full = await Dispense.findByPk(result.dispense.id, { include: dispenseInclude });
  res.status(201).json({ ...full.toJSON(), complete: result.complete });
});

const dispenseInclude = [
  { model: Prescription, as: 'prescription', include: [{ model: Patient, as: 'patient' }] },
  { model: User, as: 'user', attributes: ['id', 'name'] },
  { model: DispenseItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'unit'] }, { model: Batch, as: 'batch', attributes: ['id', 'batchNo', 'expiryDate'] }] },
];

router.get('/dispenses/:id', can('rx.view'), async (req, res) => {
  const d = await Dispense.findByPk(req.params.id, { include: dispenseInclude });
  if (!d) throw notFound('Dispense');
  const minutes = await settings.get('reverseWindowMinutes');
  res.json({ ...d.toJSON(), reversibleUntil: new Date(d.createdAt.getTime() + minutes * 60000) });
});

// Correcting entry within the reverse window; the original record stays.
router.post('/dispenses/:id/reverse', can('dispense.perform'), async (req, res) => {
  const out = await sequelize.transaction(async (t) => {
    const d = await Dispense.findByPk(req.params.id, { include: dispenseInclude, transaction: t });
    if (!d) throw notFound('Dispense');
    if (d.status === 'reversed') throw conflict('Already reversed');
    const minutes = await settings.get('reverseWindowMinutes');
    if (Date.now() - d.createdAt.getTime() > minutes * 60000) throw conflict(`Reversal is only allowed within ${minutes} minutes. Use a return instead.`);
    if (d.userId !== req.user.id && !['super_admin', 'inventory_manager'].includes(req.user.role)) throw forbidden('Only the person who dispensed can reverse');
    if (await Invoice.findOne({ where: { dispenseId: d.id }, transaction: t })) throw conflict('Already billed — process a sale return instead');
    for (const it of d.items) {
      await stock.applyMovement({ batch: it.batchId, qty: it.qty, type: 'reversal', user: req.user, refType: 'dispense', refNo: d.code, note: 'Dispense reversed', transaction: t });
      await PrescriptionItem.decrement('dispensedQty', { by: it.qty, where: { prescriptionId: d.prescriptionId, productId: it.productId }, transaction: t });
    }
    await d.update({ status: 'reversed' }, { transaction: t });
    const items = await PrescriptionItem.findAll({ where: { prescriptionId: d.prescriptionId }, transaction: t });
    const any = items.some((i) => i.dispensedQty > 0);
    await Prescription.update({ status: any ? 'partial' : 'pending' }, { where: { id: d.prescriptionId }, transaction: t });
    await audit.log({ user: req.user, category: 'stock', action: 'dispense.reversed', message: `reversed ${d.code}`, detail: d.prescription.rxNo, transaction: t });
    return d;
  });
  res.json(out);
});

// ---------- dispensing home & personal activity ----------
router.get('/dispensing/home', can('dispense.perform', 'rx.view'), async (req, res) => {
  const sod = startOfDay();
  const mine = await Dispense.findAll({ where: { userId: req.user.id, status: 'completed', createdAt: { [Op.gte]: sod } } });
  const errors = await AuditLog.count({ where: { userId: req.user.id, flag: 'blocked', createdAt: { [Op.gte]: sod } } });
  const queue = await Prescription.findAll({ where: { status: { [Op.in]: STATUS_TABS.queue } }, include: rxInclude, order: [['priority', 'DESC'], ['createdAt', 'DESC']] });
  const todays = await Dispense.findAll({ where: { status: 'completed', createdAt: { [Op.gte]: sod } }, attributes: ['prescriptionId'] });
  const doneToday = await Prescription.count({ where: { id: { [Op.in]: [...new Set(todays.map((d) => d.prescriptionId))] }, status: { [Op.in]: ['dispensed', 'billed'] } } });
  res.json({
    today: { rx: new Set(mine.map((d) => d.prescriptionId)).size, units: mine.reduce((s, d) => s + d.totalUnits, 0), errors },
    counts: { pending: queue.filter((r) => r.status !== 'partial').length, partial: queue.filter((r) => r.status === 'partial').length, done: doneToday },
    queue,
  });
});

router.get('/dispensing/activity', async (req, res) => {
  const ist = toIst();
  const mondayOffset = (ist.getUTCDay() + 6) % 7;
  const weekStart = addDays(startOfDay(), -mondayOffset);
  const dispenses = await Dispense.findAll({
    where: { userId: req.user.id, createdAt: { [Op.gte]: addDays(weekStart, -0) } },
    include: [{ model: Prescription, as: 'prescription', include: [{ model: PrescriptionItem, as: 'items' }] }, { model: DispenseItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['name'] }] }],
    order: [['createdAt', 'DESC']],
  });
  const days = Array.from({ length: 7 }, (_, i) => {
    const from = addDays(weekStart, i);
    const to = addDays(from, 1);
    return { label: 'MTWTFSS'[i], date: dateOnly(from), units: dispenses.filter((d) => d.status === 'completed' && d.createdAt >= from && d.createdAt < to).reduce((s, d) => s + d.totalUnits, 0), today: i === mondayOffset };
  });
  const total = dispenses.length;
  const reversed = dispenses.filter((d) => d.status === 'reversed').length;
  const counts = await StockCount.findAll({ where: { secondCounterId: req.user.id, createdAt: { [Op.gte]: weekStart } }, include: [{ model: User, as: 'counter', attributes: ['name'] }] });
  const returns = await StockMovement.findAll({ where: { userId: req.user.id, type: 'return', createdAt: { [Op.gte]: weekStart } }, include: [{ model: Product, as: 'product', attributes: ['name'] }] });
  const events = [
    ...dispenses.map((d) => {
      const rxItems = d.prescription.items;
      const partial = d.prescription.status === 'partial';
      return {
        kind: 'dispense', at: d.createdAt, id: `d${d.id}`, dispenseId: d.id,
        title: partial ? `${d.prescription.rxNo} · ${rxItems.filter((i) => i.dispensedQty >= i.qty).length} of ${rxItems.length} items` : `${d.prescription.rxNo} · ${d.totalUnits} units`,
        detail: d.items.length === 1 ? d.items[0].product.name : `${d.items.length} batches`,
        status: d.status === 'reversed' ? 'Reversed' : partial ? 'Partial' : 'Done',
      };
    }),
    ...counts.map((c) => ({ kind: 'count', at: c.startedAt || c.createdAt, id: `c${c.id}`, title: `Count partner · ${c.code}`, detail: `With ${c.counter ? c.counter.name : ''}`, status: 'Logged' })),
    ...returns.map((m) => ({ kind: 'return', at: m.createdAt, id: `r${m.id}`, title: `Return · ${m.product.name} ×${m.qty}`, detail: m.refNo || 'Back to shelf', status: 'Restocked' })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at));
  res.json({
    week: days,
    units: days.reduce((s, d) => s + d.units, 0),
    accuracy: total ? Math.round(((total - reversed) / total) * 100) : 100,
    events: events.slice(0, 30),
  });
});

module.exports = router;
