/* eslint-disable no-await-in-loop */
// Seeds ~6 months of demo history plus the "today" scenario shown in the designs.
// Dates are relative to when you run it, so alerts and dashboards always look current.
if (process.env.NODE_ENV === 'production') throw new Error('Refusing to load demo data in production');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const M = require('../models');
const cat = require('./catalogue');
const T = require('../utils/time');
const { DEFAULT_ROLE_PERMISSIONS } = require('../config/permissions');
const { DEFAULTS: SETTINGS } = require('../services/settings');
const alerts = require('../services/alerts');
const { pad } = require('../utils/format');

const DEMO_PASSWORD = 'Nexgen@123';
const DEMO_INVITE_CODE = '246810';
const HISTORY_DAYS = 180;

// ---------- deterministic randomness ----------
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261028);
const randInt = (a, b) => a + Math.floor(rand() * (b - a + 1));
const chance = (p) => rand() < p;
const pickOne = (arr) => arr[Math.floor(rand() * arr.length)];
function pickWeighted(pairs) {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [v, w] of pairs) { r -= w; if (r <= 0) return v; }
  return pairs[pairs.length - 1][0];
}

// ---------- time helpers (IST) ----------
const NOW = new Date();
const SOD = T.startOfDay(NOW);
const MIN = 60000;
const dayStart = (daysAgo) => T.startOfDay(T.addDays(NOW, -daysAgo));
const at = (daysAgo, h, m = 0) => new Date(dayStart(daysAgo).getTime() + (h * 60 + m) * MIN);
// Today at hh:mm — squeezed proportionally into the elapsed part of the day if that time hasn't come yet.
function todayAt(h, m = 0) {
  const mins = h * 60 + m;
  const t = SOD.getTime() + mins * MIN;
  const limit = NOW.getTime() - 3 * MIN;
  if (t <= limit) return new Date(t);
  return new Date(SOD.getTime() + Math.max(0, limit - SOD.getTime()) * (mins / 1440));
}
const minsAgo = (n) => new Date(Math.max(SOD.getTime() + MIN, NOW.getTime() - n * MIN));
const expIn = (days) => T.dateOnly(T.addDays(NOW, days));
const afterHours = (d) => T.isOutside(d, SETTINGS.workingHours.start, SETTINGS.workingHours.end);
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const round2 = (n) => Math.round(n * 100) / 100;

// ---------- numbering ----------
const counters = { invoice: 3000, rx: 1000, dispense: 4000, po: 100, grn: 300, credit_note: 80, patient: 2060 };
const approvalCounters = { adjustment: 400, purchase: 210, write_off: 50, wastage: 30, refund: 10 };
const nextCode = {
  invoice: () => `INV-${++counters.invoice}`,
  rx: () => `Rx-${++counters.rx}`,
  dispense: (d) => `DSP-${String(T.toIst(d).getUTCFullYear()).slice(2)}-${pad(++counters.dispense, 5)}`,
  po: () => `PO-${pad(++counters.po)}`,
  grn: () => `GRN-${pad(++counters.grn)}`,
  cn: () => `CN-${pad(++counters.credit_note)}`,
  approval: (type) => `${{ adjustment: 'ADJ', purchase: 'PR', write_off: 'WO', wastage: 'WS', refund: 'RF' }[type]}-${pad(++approvalCounters[type])}`,
};
function countCode(d, n) {
  const ist = T.toIst(d);
  return `CS-${pad(ist.getUTCMonth() + 1, 2)}${pad(ist.getUTCDate(), 2)}-${pad(n, 2)}`;
}

// ---------- in-memory lookups ----------
const U = {}; // staff by key
const S = {}; // suppliers by key
const P = {}; // products by sku
const B = {}; // batches by sku (array)
const BN = {}; // batch by batchNo
const PT = {}; // featured patients by key
let patients = [];
const audits = [];
const notifications = [];

function audit(user, category, action, message, detail, when, extra = {}) {
  audits.push({ userId: user ? user.id : null, category, action, message, detail, createdAt: when, meta: {}, ...extra });
}
function notifyUser(user, type, icon, title, body, when, read = false, link = null) {
  notifications.push({ userId: user.id, type, icon, title, body, link, createdAt: when, readAt: read ? when : null });
}

// FEFO batch as of a given moment.
function fefoBatch(sku, when) {
  const day = T.dateOnly(when);
  const list = (B[sku] || []).filter((b) => b.status !== 'quarantined' && b.status !== 'written_off');
  return list.find((b) => b.expiryDate > day) || list[list.length - 1];
}

function totalsFor(lines) {
  const subtotal = round2(lines.reduce((s, l) => s + l.qty * l.unitPrice, 0));
  const gstAmount = round2(lines.reduce((s, l) => s + (l.qty * l.unitPrice * l.gstRate) / 100, 0));
  const raw = round2(subtotal + gstAmount);
  const total = Math.round(raw);
  return { subtotal, gstAmount, roundOff: round2(total - raw), total };
}

// ---------- baskets ----------
const BASKETS = {
  fue: () => [['LID-230', randInt(3, 5)], ['NS-500', 2], ['CFT-001', 2], ['KET-030', 2], ...(chance(0.5) ? [['HTS-100', 1]] : []), ['POC-KIT', 1], ['DEX-004', 1]],
  prp: () => [['PRP-K10', 1], ['LID-200', 1], ['SYR-001', 2]],
  gfc: () => [['GFC-KIT', 1], ['SYR-001', 2]],
  consult: () => {
    const items = [['FIN-001', randInt(2, 6)]];
    if (chance(0.6)) items.push(['MNX-005', 1]);
    if (chance(0.35)) items.push(['BIO-10K', 1]);
    if (chance(0.2)) items.push(['KTZ-002', 1]);
    if (chance(0.15)) items.push(['DUT-005', randInt(1, 3)]);
    return items;
  },
  otc: () => {
    const items = [];
    const pool = [['MNX-005', 30], ['MNX-002', 10], ['BIO-10K', 18], ['HRV-060', 10], ['KTZ-002', 12], ['PDS-050', 6], ['SSP-100', 6], ['PCM-650', 5], ['CTZ-010', 3]];
    const n = pickWeighted([[1, 60], [2, 30], [3, 10]]);
    while (items.length < n) {
      const sku = pickWeighted(pool);
      if (!items.find((i) => i[0] === sku)) items.push([sku, sku === 'PCM-650' ? 2 : 1]);
    }
    return items;
  },
};
const VISIT = [['fue', 12], ['prp', 30], ['gfc', 5], ['consult', 53]];
const PROCEDURE = {
  fue: () => `FUE · ${pickOne(['1,800', '2,200', '2,500', '2,800', '3,000', '3,200'])} grafts`,
  prp: () => `PRP session ${randInt(1, 6)}/6`,
  gfc: () => `GFC session ${randInt(1, 4)}/4`,
  consult: () => pickOne(['Hair loss consult', 'Follow-up consult', 'AGA review', 'Post-op review']),
};

function dispenserFor(daysAgo) {
  if (daysAgo > 16) return pickWeighted([[U.priya, 50], [U.aman, 25], [U.sanjay, 25]]);
  if (daysAgo > 2) return pickWeighted([[U.priya, 65], [U.aman, 35]]);
  return pickWeighted([[U.priya, 55], [U.aman, 25], [U.sunil, 20]]);
}

// ---------- writers ----------
async function writeVisit({ when, patient, kind, items, doctor, dispenser, dispenseAt, billAt, method, status, partialSkus = [], logAudit, setting }) {
  const rx = await M.Prescription.create({
    rxNo: nextCode.rx(), patientId: patient.id, doctorId: doctor.id, procedure: PROCEDURE[kind](),
    setting: setting || (kind === 'fue' ? 'OT' : 'OPD'), priority: kind === 'fue' ? 'urgent' : 'normal', status: status || 'billed',
    createdAt: when, updatedAt: dispenseAt || when,
  });
  const rxItems = await M.PrescriptionItem.bulkCreate(items.map(([sku, qty]) => ({
    prescriptionId: rx.id, productId: P[sku].id, qty,
    dispensedQty: dispenseAt && !partialSkus.includes(sku) ? qty : 0, unavailable: partialSkus.includes(sku),
  })));
  if (!dispenseAt) return { rx, rxItems };

  const lines = items.filter(([sku]) => !partialSkus.includes(sku)).map(([sku, qty]) => ({ sku, qty, batch: fefoBatch(sku, dispenseAt) }));
  const dispense = await M.Dispense.create({
    code: nextCode.dispense(dispenseAt), prescriptionId: rx.id, userId: dispenser.id, status: 'completed',
    totalUnits: lines.reduce((s, l) => s + l.qty, 0), createdAt: dispenseAt, updatedAt: dispenseAt,
  });
  await M.DispenseItem.bulkCreate(lines.map((l) => ({ dispenseId: dispense.id, productId: P[l.sku].id, batchId: l.batch.id, qty: l.qty })));
  await M.StockMovement.bulkCreate(lines.map((l) => ({
    productId: P[l.sku].id, batchId: l.batch.id, userId: dispenser.id, type: 'dispense', qty: -l.qty, unitCost: l.batch.costPrice,
    refType: 'rx', refNo: rx.rxNo, afterHours: afterHours(dispenseAt), createdAt: dispenseAt,
  })));
  if (logAudit) {
    const first = lines[0];
    audit(dispenser, 'stock', 'dispense.completed', lines.length === 1 ? `dispensed ${first.qty} × ${P[first.sku].name}` : `dispensed ${dispense.totalUnits} units for ${rx.rxNo}`,
      `${rx.rxNo} · ${lines.length === 1 ? first.batch.batchNo : `${lines.length} batches`} · ${patient.code}`, dispenseAt, afterHours(dispenseAt) ? { flag: 'after_hours' } : {});
  }
  let invoice = null;
  if (billAt) invoice = await writeInvoice({ when: billAt, patient, lines, rx, dispense, method, logAudit });
  return { rx, rxItems, dispense, invoice };
}

async function writeInvoice({ when, patient, lines, rx, dispense, method, logAudit, paidAmount, status, sale, user }) {
  const full = lines.map((l) => {
    const batch = l.batch || fefoBatch(l.sku, when);
    const p = P[l.sku];
    return { sku: l.sku, qty: l.qty, batch, unitPrice: p.sellingPrice, unitCost: batch.costPrice, gstRate: Number(p.gstRate) };
  });
  const totals = totalsFor(full);
  const m = method || pickWeighted([['upi', 62], ['cash', 24], ['card', 14]]);
  const paid = paidAmount !== undefined ? paidAmount : m === 'insurance' ? 0 : totals.total;
  const by = user || U.neha;
  const inv = await M.Invoice.create({
    invNo: nextCode.invoice(), patientId: patient.id, prescriptionId: rx ? rx.id : null, dispenseId: dispense ? dispense.id : null,
    ...totals, paidAmount: paid, paymentMethod: m, createdBy: by.id, issuedAt: when, createdAt: when, updatedAt: when,
    status: status || (m === 'insurance' ? 'claim' : paid >= totals.total ? 'paid' : 'due'),
    paymentRef: m === 'upi' ? `${randInt(1000, 9999)} ${randInt(1000, 9999)} ${randInt(1000, 9999)}` : null,
  });
  const items = await M.InvoiceItem.bulkCreate(full.map((l) => ({
    invoiceId: inv.id, productId: P[l.sku].id, batchId: l.batch.id, qty: l.qty, unitPrice: l.unitPrice, unitCost: l.unitCost, gstRate: l.gstRate, amount: round2(l.qty * l.unitPrice),
  })));
  if (sale) {
    await M.StockMovement.bulkCreate(full.map((l) => ({
      productId: P[l.sku].id, batchId: l.batch.id, userId: by.id, type: 'sale', qty: -l.qty, unitCost: l.unitCost, refType: 'invoice', refNo: inv.invNo, createdAt: when,
    })));
  }
  if (m === 'split') {
    const upi = Math.min(paid, Math.round(paid * 0.6));
    await M.Payment.bulkCreate([{ invoiceId: inv.id, method: 'upi', amount: upi, receivedBy: by.id, createdAt: when }, { invoiceId: inv.id, method: 'cash', amount: paid - upi, receivedBy: by.id, createdAt: when }].filter((p) => p.amount > 0));
  } else if (paid > 0) {
    await M.Payment.create({ invoiceId: inv.id, method: m, amount: paid, ref: inv.paymentRef, receivedBy: by.id, createdAt: when });
  }
  if (logAudit) audit(by, 'billing', 'invoice.created', `created invoice ${inv.invNo}`, `${patient.code} · ₹${inv.total.toLocaleString('en-IN')} · ${m.toUpperCase()}`, when);
  return { inv, items };
}

async function writeGrn({ when, supplier, lines, receiver, poStatus = 'received', logAudit }) {
  const total = round2(lines.reduce((s, l) => s + l.qty * P[l.sku].purchasePrice, 0));
  const placed = new Date(when.getTime() - Number(supplier.leadDays) * 86400000);
  const po = await M.PurchaseOrder.create({
    poNo: nextCode.po(), supplierId: supplier.id, status: poStatus, eta: when, total, placedAt: placed, createdBy: U.rahul.id, approvedBy: U.nilesh.id, createdAt: placed, updatedAt: when,
  });
  await M.PurchaseOrderItem.bulkCreate(lines.map((l) => ({ poId: po.id, productId: P[l.sku].id, qty: l.qty, unitPrice: P[l.sku].purchasePrice, receivedQty: l.qty })));
  const grn = await M.Grn.create({
    grnNo: nextCode.grn(), poId: po.id, supplierId: supplier.id, invoiceNo: `${supplier.code}/${String(T.toIst(when).getUTCFullYear()).slice(2)}/${randInt(1000, 9999)}`,
    invoiceDate: T.dateOnly(when), status: 'posted', orderedValue: total, receivedValue: total, postedAt: when, receivedBy: receiver.id, createdAt: when, updatedAt: when,
  });
  await M.GrnItem.bulkCreate(lines.map((l) => ({
    grnId: grn.id, productId: P[l.sku].id, batchNo: l.batchNo || `${l.sku.slice(0, 2)}-${randInt(2300, 2499)}`,
    expiryDate: l.expiryDate || T.dateOnly(T.addDays(when, randInt(400, 800))), orderedQty: l.qty, receivedQty: l.qty, unitCost: P[l.sku].purchasePrice, checked: true,
  })));
  if (logAudit) {
    const units = lines.reduce((s, l) => s + l.qty, 0);
    audit(receiver, 'stock', 'grn.posted', `received ${grn.grnNo}`, `${supplier.name.split(' ')[0]} · ${lines.length} lines · +${units} units · ₹${total.toLocaleString('en-IN')}`, when);
  }
  return { po, grn, total };
}

async function writeApproval({ type, maker, when, status = 'pending', checker, decidedAt, ...fields }) {
  return M.Approval.create({
    code: nextCode.approval(type), type, status, makerId: maker.id, checkerId: checker ? checker.id : null, decidedAt: decidedAt || null,
    createdAt: when, updatedAt: decidedAt || when, ...fields,
  });
}

// ======================================================================
async function main() {
  console.log('Seeding Nexgen Inventory demo data…');
  await M.Setting.bulkCreate(Object.entries(SETTINGS).map(([key, value]) => ({ key, value })));
  await M.RolePermission.bulkCreate(Object.entries(DEFAULT_ROLE_PERMISSIONS).map(([role, permissions]) => ({ role, permissions })));

  // ---------- staff ----------
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  for (const s of cat.staff) {
    const status = s.status || 'active';
    U[s.key] = await M.User.create({
      ...s, status, passwordHash: status === 'invited' ? null : hash, shiftOnly: false,
      lastSeenAt: status === 'active' ? minsAgo(randInt(1, 120)) : null,
      ...(status === 'invited' ? { inviteCodeHash: sha(DEMO_INVITE_CODE), inviteExpiresAt: T.addDays(NOW, 5), invitedAt: T.addDays(NOW, -2) } : {}),
      ...(status === 'inactive' ? { deactivatedAt: T.addDays(NOW, -16) } : {}),
      createdAt: T.addDays(NOW, s.key === 'sunil' ? -3 : -200),
    });
  }

  // ---------- suppliers & products ----------
  for (const s of cat.suppliers) S[s.key] = await M.Supplier.create(s);
  let i = 0;
  for (const row of cat.products) {
    const [sku, name, type, category, unit, packInfo, manufacturer, cost, sell, gst, min, reorder, rx, cold, location, sup] = row;
    i += 1;
    P[sku] = await M.Product.create({
      sku, name, type, category, unit, packInfo, manufacturer, brand: manufacturer, purchasePrice: cost, sellingPrice: sell, gstRate: gst,
      minLevel: min, reorderQty: reorder, rxRequired: rx, coldChain: cold, location, preferredSupplierId: S[sup].id,
      barcode: `890${pad(4471000 + i * 37, 10)}`,
      storage: cold ? 'Store at 2–8 °C in OT fridge. Do not freeze.' : type === 'medicine' ? 'Store below 25 °C, dry. Keep away from light.' : 'Store in a clean, dry place.',
      createdAt: T.addDays(NOW, -200),
    });
    P[sku].supplierKey = sup;
  }

  // ---------- batches ----------
  async function addBatch(sku, batchNo, qty, expDays, extra = {}) {
    const p = P[sku];
    const receivedDaysAgo = extra.receivedDaysAgo ?? randInt(20, 140);
    const b = await M.Batch.create({
      productId: p.id, supplierId: S[extra.supplier || p.supplierKey].id, batchNo, qty, expiryDate: expIn(expDays),
      receivedQty: extra.receivedQty ?? qty + randInt(0, Math.max(4, qty)), costPrice: extra.costPrice ?? p.purchasePrice,
      location: extra.location || p.location, status: extra.status || 'active', quarantineReason: extra.quarantineReason,
      receivedAt: T.addDays(NOW, -receivedDaysAgo), barcode: `(01)${p.barcode}(10)${batchNo}`,
    });
    (B[sku] = B[sku] || []).push(b);
    BN[batchNo] = b;
    return b;
  }
  for (const [sku, no, qty, days, extra] of cat.featuredBatches) await addBatch(sku, no, qty, days, extra);
  for (const [sku] of cat.products) {
    if (B[sku] || sku === 'SPH-08') continue;
    const p = P[sku];
    const prefix = sku.replace(/[^A-Z]/g, '').slice(0, 2);
    const n = chance(0.5) ? 2 : 1;
    for (let k = 0; k < n; k += 1) {
      await addBatch(sku, `${prefix}-24${pad(randInt(1, 12), 2)}${k ? 'B' : ''}`, Math.round(p.minLevel * (1.4 + rand() * 2.4)), randInt(160, 720));
    }
  }
  Object.values(B).forEach((list) => list.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate)));

  // ---------- patients ----------
  const featuredCodes = { rohit: 2058, ankit: 2047, sneha: 2031, vikas: 2044, pooja: 2039, manish: 2036 };
  for (const p of cat.featuredPatients) PT[p.key] = await M.Patient.create({ ...p, code: `PT-${featuredCodes[p.key]}` });
  const used = new Set(Object.values(featuredCodes));
  const gen = [];
  for (let c = 2000; c <= 2060; c += 1) {
    if (used.has(c)) continue;
    gen.push({ code: `PT-${c}`, name: `${pickOne(cat.firstNames)} ${pickOne(cat.lastNames)}`, phone: `+91 9${randInt(100, 999)}${randInt(10, 99)} ${randInt(10000, 99999)}`, gender: chance(0.75) ? 'M' : 'F', age: randInt(22, 55) });
  }
  patients = [...Object.values(PT), ...(await M.Patient.bulkCreate(gen))];
  const randomPatient = () => pickOne(patients.slice(6));

  // ---------- history: sales, dispensing ----------
  console.log('  • 6 months of sales & dispensing history');
  const monthSales = {};
  for (let d = HISTORY_DAYS; d >= 1; d -= 1) {
    const day = dayStart(d);
    const sunday = T.istDow(day) === 0;
    const growth = 0.8 + 0.2 * (1 - d / HISTORY_DAYS);
    const recent = d <= 30;
    const logAudit = d <= 7;
    const visits = Math.round((recent ? randInt(6, 10) : randInt(7, 12)) * growth * (sunday ? 0.4 : 1));
    const otc = Math.round(randInt(3, 6) * growth * (sunday ? 0.5 : 1));

    for (let v = 0; v < visits; v += 1) {
      const kind = pickWeighted(VISIT);
      const patient = randomPatient();
      const doctor = kind === 'fue' ? U.nilesh : kind === 'consult' ? pickOne([U.nilesh, U.ankita]) : U.ankita;
      const dispenser = dispenserFor(d);
      const late = dispenser === U.aman && chance(0.15);
      const h = late ? 20 : randInt(9, 18);
      const dispAt = at(d, h, randInt(late ? 5 : 0, late ? 45 : 59));
      const when = new Date(dispAt.getTime() - randInt(10, 90) * MIN);
      const billAt = new Date(dispAt.getTime() + randInt(4, 35) * MIN);
      if (recent) {
        const { invoice } = await writeVisit({ when, patient, kind, items: BASKETS[kind](), doctor, dispenser, dispenseAt: dispAt, billAt, logAudit });
        monthSales[T.dateOnly(billAt).slice(0, 7)] = (monthSales[T.dateOnly(billAt).slice(0, 7)] || 0) + Number(invoice.inv.total);
      } else {
        // Before go-live, visits were billed straight from the counter.
        const { inv } = await writeInvoice({ when: billAt, patient, lines: BASKETS[kind]().map(([sku, qty]) => ({ sku, qty })) });
        monthSales[T.dateOnly(billAt).slice(0, 7)] = (monthSales[T.dateOnly(billAt).slice(0, 7)] || 0) + Number(inv.total);
      }
    }
    for (let o = 0; o < otc; o += 1) {
      const when = at(d, randInt(10, 19), randInt(0, 59));
      const { inv } = await writeInvoice({ when, patient: randomPatient(), lines: BASKETS.otc().map(([sku, qty]) => ({ sku, qty })), sale: recent, logAudit });
      monthSales[T.dateOnly(when).slice(0, 7)] = (monthSales[T.dateOnly(when).slice(0, 7)] || 0) + Number(inv.total);
    }
    if (logAudit) {
      [U.priya, U.rahul, U.neha, U.nilesh, U.aman].forEach((u) => audit(u, 'security', 'login.success', 'signed in', u === U.nilesh ? 'Pixel 8 · Nexgen app' : 'Nexgen app', at(d, 9, randInt(0, 30))));
    }
  }

  // ---------- history: purchasing ----------
  console.log('  • purchase orders & goods received');
  const supplierMix = [['medline', 45], ['bihar', 22], ['regen', 8], ['shree', 10], ['apex', 8], ['surgimax', 7]];
  const bySupplier = {};
  cat.products.forEach(([sku, , , , , , , , , , , , , , , sup]) => { (bySupplier[sup] = bySupplier[sup] || []).push(sku); });
  const months = Object.keys(monthSales).sort();
  for (const month of months) {
    const target = monthSales[month] * (0.72 + rand() * 0.12);
    const [y, m] = month.split('-').map(Number);
    let spent = 0;
    let guard = 0;
    while (spent < target && guard < 40) {
      guard += 1;
      const dayOfMonth = randInt(1, 28);
      const when = new Date(Date.UTC(y, m - 1, dayOfMonth, 11 - 5, randInt(0, 59)) - 30 * MIN);
      const daysAgo = Math.floor((SOD - T.startOfDay(when)) / 86400000);
      if (daysAgo < 1 || daysAgo > HISTORY_DAYS) continue;
      const sup = pickWeighted(supplierMix);
      const pool = bySupplier[sup];
      const lines = [];
      const n = Math.min(pool.length, randInt(2, 6));
      while (lines.length < n) {
        const sku = pickOne(pool);
        if (!lines.find((l) => l.sku === sku)) lines.push({ sku, qty: P[sku].reorderQty });
      }
      const { total } = await writeGrn({ when, supplier: S[sup], lines, receiver: U.rahul, logAudit: daysAgo <= 7 });
      spent += total;
    }
  }

  // ---------- approvals history (this month) ----------
  console.log('  • approvals, counts, discrepancies');
  async function writtenOffBatch(sku, batchNo, qty, daysAgo) {
    const p = P[sku];
    const b = await M.Batch.create({ productId: p.id, supplierId: S[p.supplierKey].id, batchNo, qty: 0, receivedQty: qty + 10, expiryDate: expIn(-daysAgo - 2), costPrice: p.purchasePrice, location: p.location, status: 'written_off', receivedAt: T.addDays(NOW, -300), barcode: `(01)${p.barcode}(10)${batchNo}` });
    return b;
  }
  const woDefs = [['PRP-K10', 'PR-2402', 2, 12], ['CFT-001', 'CF-2304', 8, 9], ['DEX-004', 'DX-2302', 10, 5], ['NS-500', 'NS-2301', 5, 3]];
  for (const [sku, no, qty, daysAgo] of woDefs) {
    const b = await writtenOffBatch(sku, no, qty, daysAgo);
    const when = at(daysAgo, 10, 15);
    const decided = at(daysAgo, 17, 40);
    const value = qty * b.costPrice;
    await writeApproval({
      type: 'write_off', maker: U.rahul, when, status: 'approved', checker: U.nilesh, decidedAt: decided, productId: P[sku].id, batchId: b.id,
      qtyChange: -qty, valueImpact: -value, reasonCode: 'expired', reason: 'Expired stock', title: 'Expired write-off',
      subtitle: `${P[sku].name} · ${qty} ${P[sku].unit}s`, checkerNote: 'Approved. Destroy as per BMW rules.',
      payload: { batches: [{ batchId: b.id, batchNo: no, product: P[sku].name, qty, value }] },
    });
    await M.StockMovement.create({ productId: P[sku].id, batchId: b.id, userId: U.rahul.id, type: 'write_off', qty: -qty, balanceAfter: 0, unitCost: b.costPrice, refType: 'approval', refNo: `WO-${pad(approvalCounters.write_off)}`, note: 'Expired stock', createdAt: decided });
  }
  const wastageDefs = [[U.priya, 'LD-2407', 1, 'dropped', 'Dropped', 'Vial slipped from tray during OT prep', 8, 'approved'], [U.aman, 'GL-2409', 3, 'damage', 'Damaged', 'Torn while donning', 6, 'approved'], [U.priya, 'GL-2409', 4, 'damage', 'Damaged', 'Torn · 4 pairs', 2, 'rejected']];
  for (const [maker, no, qty, code, reason, note, daysAgo, status] of wastageDefs) {
    const b = BN[no];
    const p = cat.products.find((x) => x[0] === Object.keys(B).find((sku) => B[sku].includes(b)));
    const sku = p[0];
    const when = at(daysAgo, 13, 20);
    const decided = at(daysAgo, 18, 5);
    await writeApproval({
      type: 'wastage', maker, when, status, checker: U.nilesh, decidedAt: decided, productId: P[sku].id, batchId: b.id, qtyChange: -qty, systemQty: b.qty + qty,
      valueImpact: -qty * b.costPrice, reasonCode: code, reason, note, title: 'Wastage request', subtitle: `${P[sku].name} · ${qty} ${P[sku].unit}s`,
      checkerNote: status === 'rejected' ? 'Not enough detail — log each damaged pair at the time it happens.' : 'Approved',
    });
    if (status === 'approved') await M.StockMovement.create({ productId: P[sku].id, batchId: b.id, userId: maker.id, type: 'wastage', qty: -qty, unitCost: b.costPrice, refType: 'approval', note: reason, createdAt: decided });
  }

  // ---------- stock counts ----------
  async function writeCount({ daysAgo, h, m, n, area, prefix, counter, second, status, lines }) {
    const when = daysAgo === 0 ? todayAt(h, m) : at(daysAgo, h, m);
    const count = await M.StockCount.create({
      code: countCode(when, n), area, locationPrefix: prefix, counterId: counter.id, secondCounterId: second ? second.id : null, status,
      scheduledAt: when, startedAt: status === 'scheduled' ? null : when, finishedAt: ['completed', 'submitted'].includes(status) ? new Date(when.getTime() + 25 * MIN) : null, createdAt: when,
    });
    const items = [];
    for (const l of lines) {
      const b = l.batch;
      items.push(await M.StockCountItem.create({
        stockCountId: count.id, productId: b.productId, batchId: b.id, location: b.location, systemQty: l.system ?? b.qty,
        countedQty: l.counted === undefined ? null : l.counted, countedAt: l.counted === undefined ? null : new Date(when.getTime() + randInt(2, 20) * MIN),
        resolution: l.resolution || 'open', recount: !!l.recount, approvalId: l.approvalId || null,
      }));
    }
    return { count, items };
  }
  const inLoc = (prefix) => Object.values(B).flat().filter((b) => b.status !== 'written_off' && b.location.startsWith(prefix));

  // 14 days ago — Rack C: Minoxidil short by 3 (still open)
  await writeCount({ daysAgo: 14, h: 17, m: 10, n: 1, area: 'Rack C · Topicals', prefix: 'Rack C', counter: U.rahul, second: U.sanjay, status: 'completed',
    lines: inLoc('Rack C').map((b) => (b.batchNo === 'MX-2408' ? { batch: b, system: 28, counted: 25 } : { batch: b, counted: b.qty })) });
  // 10 days ago — Rack B1: Lidocaine short by 4 (approved, resolved)
  const ld = BN['LD-2407'];
  const ldAppr = await writeApproval({
    type: 'adjustment', maker: U.rahul, when: at(10, 17, 50), status: 'approved', checker: U.nilesh, decidedAt: at(10, 19, 5), productId: ld.productId, batchId: ld.id,
    qtyChange: -4, systemQty: 28, valueImpact: -4 * ld.costPrice, reasonCode: 'count_correction', reason: 'Physical count mismatch', note: 'Recounted twice.',
    title: 'Stock adjustment', subtitle: `${P['LID-230'].name} · −4 vials`, checkerNote: 'Approve. Move vials to locked tray.',
  });
  await M.StockMovement.create({ productId: ld.productId, batchId: ld.id, userId: U.rahul.id, type: 'adjustment', qty: -4, unitCost: ld.costPrice, refType: 'approval', refNo: ldAppr.code, note: 'Physical count mismatch', createdAt: at(10, 19, 5) });
  await writeCount({ daysAgo: 10, h: 17, m: 20, n: 1, area: 'Rack B1 · Anaesthetics', prefix: 'Rack B1', counter: U.rahul, second: U.priya, status: 'submitted',
    lines: inLoc('Rack B1').map((b) => (b.batchNo === 'LD-2407' ? { batch: b, system: 28, counted: 24, resolution: 'resolved', approvalId: ldAppr.id } : { batch: b, counted: b.qty })) });
  // 7 days ago — Rack F1 gloves & OT fridge PRP (recount asked)
  await writeCount({ daysAgo: 7, h: 18, m: 0, n: 1, area: 'Rack F1 · Gloves', prefix: 'Rack F1', counter: U.rahul, second: U.aman, status: 'completed',
    lines: inLoc('Rack F1').map((b) => (b.batchNo === 'GL-2409' ? { batch: b, system: 96, counted: 94, resolution: 'checking' } : { batch: b, counted: b.qty })) });
  await writeCount({ daysAgo: 7, h: 18, m: 40, n: 2, area: 'OT fridge', prefix: 'OT fridge', counter: U.rahul, second: U.aman, status: 'completed',
    lines: inLoc('OT fridge').map((b) => (b.batchNo === 'PR-2406' ? { batch: b, system: 9, counted: 8, resolution: 'checking' } : { batch: b, counted: b.qty })) });
  // 5 days ago — Rack A2 biotin +1 (resolved)
  const bt = BN['BT-2409'];
  const btAppr = await writeApproval({
    type: 'adjustment', maker: U.rahul, when: at(5, 16, 30), status: 'approved', checker: U.nilesh, decidedAt: at(5, 18, 0), productId: bt.productId, batchId: bt.id,
    qtyChange: 1, systemQty: 19, valueImpact: bt.costPrice, reasonCode: 'count_correction', reason: 'Physical count mismatch', note: 'Extra bottle found behind rack',
    title: 'Stock adjustment', subtitle: `${P['BIO-10K'].name} · +1 bottles`, checkerNote: 'OK',
  });
  await writeCount({ daysAgo: 5, h: 16, m: 10, n: 1, area: 'Rack A2 · Supplements', prefix: 'Rack A2', counter: U.rahul, second: U.priya, status: 'submitted',
    lines: inLoc('Rack A2').map((b) => (b.batchNo === 'BT-2409' ? { batch: b, system: 19, counted: 20, resolution: 'resolved', approvalId: btAppr.id } : { batch: b, counted: b.qty })) });

  // ---------- yesterday ----------
  console.log('  • yesterday & today scenario');
  const sneha1 = await writeVisit({ when: at(1, 9, 40), patient: PT.sneha, kind: 'fue', items: [['LID-230', 5], ['NS-500', 2], ['CFT-001', 2], ['KET-030', 2], ['HTS-100', 1], ['POC-KIT', 1]], doctor: U.nilesh, dispenser: U.priya, dispenseAt: at(1, 10, 5), billAt: at(1, 15, 2), method: 'insurance', logAudit: true });
  void sneha1;
  await writeInvoice({ when: at(1, 18, 40), patient: PT.manish, lines: [{ sku: 'MNX-005', qty: 2 }, { sku: 'BIO-10K', qty: 2 }, { sku: 'KTZ-002', qty: 1 }], method: 'upi', sale: true, logAudit: true });
  const triWo = await writeApproval({
    type: 'write_off', maker: U.rahul, when: minsAgo(19 * 60), productId: BN['TA-2201'].productId, batchId: BN['TA-2201'].id, qtyChange: -12, valueImpact: -12 * BN['TA-2201'].costPrice,
    reasonCode: 'expired', reason: `Expired ${BN['TA-2201'].expiryDate}`, title: 'Expired write-off', subtitle: `${P['TRI-040'].name} · 12 vials`,
    payload: { batches: [{ batchId: BN['TA-2201'].id, batchNo: 'TA-2201', product: P['TRI-040'].name, qty: 12, value: 12 * BN['TA-2201'].costPrice, expiryDate: BN['TA-2201'].expiryDate }] },
  });
  const rlWo = await writeApproval({
    type: 'write_off', maker: U.rahul, when: minsAgo(18 * 60 + 40), productId: BN['RL-2208'].productId, batchId: BN['RL-2208'].id, qtyChange: -6, valueImpact: -6 * BN['RL-2208'].costPrice,
    reasonCode: 'expired', reason: `Expired ${BN['RL-2208'].expiryDate}`, title: 'Expired write-off', subtitle: `${P['RL-500'].name} · 6 bags`,
    payload: { batches: [{ batchId: BN['RL-2208'].id, batchNo: 'RL-2208', product: P['RL-500'].name, qty: 6, value: 6 * BN['RL-2208'].costPrice, expiryDate: BN['RL-2208'].expiryDate }] },
  });
  audit(U.rahul, 'approvals', 'write_off.requested', `requested expired write-off ${triWo.code}`, `${P['TRI-040'].name} · 12 vials`, triWo.createdAt);
  audit(U.rahul, 'approvals', 'write_off.requested', `requested expired write-off ${rlWo.code}`, `${P['RL-500'].name} · 6 bags`, rlWo.createdAt);
  await M.StockMovement.create({ productId: BN['BT-2409'].productId, batchId: BN['BT-2409'].id, userId: U.priya.id, type: 'return', qty: 2, unitCost: BN['BT-2409'].costPrice, refType: 'rx', refNo: 'Rx-unused', note: 'Unused, back to shelf', createdAt: at(1, 9, 12) });
  audit(U.priya, 'stock', 'stock.returned', 'returned 2 × Biotin 10,000 mcg', 'BT-2409 · unused', at(1, 9, 12));
  audit(U.nilesh, 'security', 'login.failed', 'Failed sign-in', 'Unknown Android · Hajipur', at(1, 23, 13), { ip: '49.37.12.200' });
  audit(U.nilesh, 'security', 'login.failed', 'Failed sign-in', 'Unknown Android · Hajipur', at(1, 23, 14), { ip: '49.37.12.200' });

  // ---------- today ----------
  const todayEvents = [];
  const ev = (when, fn) => todayEvents.push({ when, fn });

  ev(todayAt(8, 3), async () => {
    audit(U.sunil, 'security', 'login.failed', 'Failed sign-in ×2 · sunil@…', 'Unknown Android · Hajipur', todayAt(8, 3));
  });
  [[U.priya, 9, 2], [U.rahul, 9, 5], [U.neha, 9, 10], [U.nilesh, 9, 30], [U.aman, 10, 30], [U.sunil, 10, 45]].forEach(([u, h, m]) => ev(todayAt(h, m), async () => audit(u, 'security', 'login.success', 'signed in', 'Nexgen app', todayAt(h, m))));

  // Generic day: visits & OTC up to now
  const todayVisits = [[9, 50], [10, 35], [11, 10], [12, 5], [13, 25], [14, 40], [15, 30], [17, 15], [18, 20]];
  todayVisits.forEach(([h, m]) => ev(todayAt(h, m), async () => {
    const kind = pickWeighted([['prp', 35], ['consult', 55], ['gfc', 10]]);
    const d = todayAt(h, m);
    await writeVisit({ when: new Date(d.getTime() - 20 * MIN), patient: randomPatient(), kind, items: BASKETS[kind](), doctor: kind === 'consult' ? U.nilesh : U.ankita, dispenser: pickOne([U.priya, U.priya, U.aman, U.sunil]), dispenseAt: d, billAt: new Date(d.getTime() + 12 * MIN), logAudit: true });
  }));
  [[10, 20], [11, 45], [12, 50], [14, 10], [16, 5], [17, 40]].forEach(([h, m]) => ev(todayAt(h, m), async () => {
    await writeInvoice({ when: todayAt(h, m), patient: randomPatient(), lines: BASKETS.otc().map(([sku, qty]) => ({ sku, qty })), sale: true, logAudit: true });
  }));

  // Count CS-…-02 this morning: Ketorolac short by 6 → pending adjustment
  ev(todayAt(9, 40), async () => {
    const kt = BN['KT-2312'];
    const appr = await writeApproval({
      type: 'adjustment', maker: U.rahul, when: todayAt(9, 55), productId: kt.productId, batchId: kt.id, qtyChange: -6, systemQty: kt.qty, valueImpact: -6 * kt.costPrice,
      reasonCode: 'count_correction', reason: 'Physical count mismatch', note: 'Counted twice with Priya at 09:40. Box seal intact, 6 vials missing from tray.',
      title: 'Stock adjustment', subtitle: `${P['KET-030'].name} · −6 vials`, payload: { countCode: countCode(todayAt(9, 40), 2), secondCounter: 'Priya Sinha' },
    });
    await writeCount({ daysAgo: 0, h: 9, m: 40, n: 2, area: 'Rack B2 · Injectables', prefix: 'Rack B2', counter: U.rahul, second: U.priya, status: 'submitted',
      lines: inLoc('Rack B2').map((b) => (b.batchNo === 'KT-2312' ? { batch: b, counted: 18, approvalId: appr.id } : { batch: b, counted: b.qty })) });
    audit(U.rahul, 'approvals', 'adjustment.requested', `requested adjustment ${appr.code}`, `${P['KET-030'].name} · 24 → 18 vials · count mismatch`, todayAt(9, 55));
    notifyUser(U.nilesh, 'critical', 'flag', 'Count mismatch on Ketorolac', '−6 units vs system · Rack B2', todayAt(9, 41));
    notifyUser(U.nilesh, 'approval', 'check', 'Stock adjustment needs approval', `${appr.code} · Ketorolac −6 · by Rahul Verma`, todayAt(9, 56), false, `approval:${appr.id}`);
  });

  // Today's GRN from Medline
  ev(todayAt(11, 30), async () => {
    const lines = [['NS-500', 60], ['SYR-005', 100], ['GZE-010', 80], ['DRS-POP', 30], ['SSP-100', 20], ['MNX-002', 20]].map(([sku, qty]) => ({ sku, qty }));
    const { grn } = await writeGrn({ when: todayAt(11, 30), supplier: S.medline, lines, receiver: U.rahul, logAudit: true });
    notifyUser(U.nilesh, 'info', 'truck', `${grn.grnNo} received`, `Medline · +${lines.reduce((s, l) => s + l.qty, 0)} units by Rahul`, todayAt(11, 31));
  });

  // Pooja: card sale, then partial return of sealed Minoxidil
  ev(todayAt(11, 20), async () => {
    const { inv, items } = await writeInvoice({ when: todayAt(11, 20), patient: PT.pooja, lines: [{ sku: 'MNX-005', qty: 1 }, { sku: 'BIO-10K', qty: 1 }], method: 'card', sale: true, logAudit: true });
    const it = items.find((x) => x.productId === P['MNX-005'].id);
    const amount = Math.round(it.unitPrice * (1 + Number(it.gstRate) / 100));
    const sr = await M.SaleReturn.create({ code: nextCode.cn(), invoiceId: inv.id, reason: 'Patient changed plan', refundMethod: 'Card', amount, createdBy: U.neha.id, status: 'completed', createdAt: todayAt(15, 10) });
    await M.SaleReturnItem.create({ saleReturnId: sr.id, invoiceItemId: it.id, productId: it.productId, batchId: it.batchId, qty: 1, amount, restock: true });
    await it.update({ returnedQty: 1 });
    await inv.update({ status: 'part_return' });
    await M.StockMovement.create({ productId: it.productId, batchId: it.batchId, userId: U.neha.id, type: 'sale_return', qty: 1, unitCost: it.unitCost, refType: 'sale_return', refNo: sr.code, note: 'Patient changed plan', createdAt: todayAt(15, 10) });
    audit(U.neha, 'billing', 'sale_return.completed', `processed return ${sr.code}`, `${inv.invNo} · ₹${amount} · Card`, todayAt(15, 10));
  });

  // PRP patient — split payment, balance due
  ev(todayAt(12, 40), async () => {
    const p = randomPatient();
    const r = await writeVisit({ when: todayAt(12, 20), patient: p, kind: 'prp', items: [['PRP-K10', 1], ['LID-200', 1], ['SYR-001', 2]], doctor: U.ankita, dispenser: U.priya, dispenseAt: todayAt(12, 40), logAudit: true });
    const lines = [{ sku: 'PRP-K10', qty: 1, batch: fefoBatch('PRP-K10', todayAt(12, 40)) }, { sku: 'LID-200', qty: 1, batch: fefoBatch('LID-200', todayAt(12, 40)) }, { sku: 'SYR-001', qty: 2, batch: fefoBatch('SYR-001', todayAt(12, 40)) }];
    await writeInvoice({ when: todayAt(13, 5), patient: p, lines, rx: r.rx, dispense: r.dispense, method: 'split', paidAmount: 2000, logAudit: true });
  });

  // Vikas — consult, cash
  ev(todayAt(16, 30), async () => {
    const items = [['FIN-001', 4], ['MNX-005', 1], ['KTZ-002', 1]];
    await writeVisit({ when: todayAt(16, 10), patient: PT.vikas, kind: 'consult', items, doctor: U.nilesh, dispenser: U.priya, dispenseAt: todayAt(16, 30), billAt: todayAt(16, 48), method: 'cash', logAudit: true });
  });

  // Sneha — partial FUE dispense (bupivacaine out of stock), waiting
  ev(todayAt(16, 20), async () => {
    await writeVisit({
      when: todayAt(15, 50), patient: PT.sneha, kind: 'fue', setting: 'OT',
      items: [['LID-230', 2], ['NS-500', 1], ['KET-030', 1], ['BUP-005', 1]], doctor: U.nilesh, dispenser: U.priya, dispenseAt: todayAt(16, 20), status: 'partial', partialSkus: ['BUP-005'], logAudit: true,
    });
  });

  // Aman: three requests in a day + a blocked expired issue
  ev(todayAt(14, 0), async () => {
    const b = BN['NS-2408'];
    const a = await writeApproval({ type: 'wastage', maker: U.aman, when: todayAt(14, 0), productId: b.productId, batchId: b.id, qtyChange: -2, systemQty: b.qty, valueImpact: -2 * b.costPrice, reasonCode: 'damage', reason: 'Damaged', note: 'Bags punctured while opening OT carton.', title: 'Wastage request', subtitle: `${P['NS-500'].name} · 2 bags`, payload: { rxNo: null } });
    audit(U.aman, 'approvals', 'wastage.requested', `requested wastage ${a.code}`, 'Saline 0.9% · 2 bags · damaged during OT setup', todayAt(14, 0));
  });
  ev(todayAt(14, 20), async () => audit(U.aman, 'stock', 'dispense.blocked', 'Blocked dispensing of expired batch', `${P['TRI-040'].name} TA-2201 · by Aman R.`, todayAt(14, 20), { flag: 'blocked' }));
  ev(todayAt(15, 10), async () => {
    const b = BN['LD-2407'];
    const a = await writeApproval({ type: 'adjustment', maker: U.aman, when: todayAt(15, 10), productId: b.productId, batchId: b.id, qtyChange: -1, systemQty: b.qty, valueImpact: -b.costPrice, reasonCode: 'damage', reason: 'Damaged', note: 'Vial cracked in tray', title: 'Stock adjustment', subtitle: `${P['LID-230'].name} · −1 vials` });
    audit(U.aman, 'approvals', 'adjustment.requested', `requested adjustment ${a.code}`, 'Lidocaine 2% + Adr · 23 → 22 · "cracked"', todayAt(15, 10));
  });
  ev(todayAt(17, 2), async () => {
    const b = BN['GL-2409'];
    const a = await writeApproval({ type: 'adjustment', maker: U.aman, when: todayAt(17, 2), productId: b.productId, batchId: b.id, qtyChange: -4, systemQty: b.qty, valueImpact: -4 * b.costPrice, reasonCode: 'damage', reason: 'Damaged', note: 'torn', title: 'Stock adjustment', subtitle: `${P['GLV-07'].name} · −4 pairs` });
    audit(U.aman, 'approvals', 'adjustment.requested', 'requested adjustment', `Gloves size 7 · 94 → 90 pairs · "torn"`, todayAt(17, 2), { flag: '3rd today' });
    notifyUser(U.nilesh, 'approval', 'check', '3 adjustments need approval', 'Aman Raj raised 3 requests in 24 h', todayAt(17, 3), false, 'approvals');
  });

  // Purchasing: PRP kits + N95 pending; Bihar order approved this evening
  ev(todayAt(15, 0), async () => {
    const po = await M.PurchaseOrder.create({ poNo: nextCode.po(), supplierId: S.regen.id, status: 'approval', eta: T.addDays(SOD, 2), total: 40 * P['PRP-K10'].purchasePrice, createdBy: U.rahul.id, createdAt: todayAt(15, 0), notes: 'Cold chain · 2–8 °C' });
    await M.PurchaseOrderItem.create({ poId: po.id, productId: P['PRP-K10'].id, qty: 40, unitPrice: P['PRP-K10'].purchasePrice });
    const a = await writeApproval({ type: 'purchase', maker: U.rahul, when: todayAt(15, 0), valueImpact: po.total, refType: 'purchase_order', refId: po.id, reason: 'Below reorder level', title: 'Purchase request', subtitle: `PRP kit (ACD-A tubes) ×40 · ${S.regen.name}`, payload: { poNo: po.poNo } });
    audit(U.rahul, 'approvals', 'purchase.requested', `raised purchase request ${a.code}`, `PRP kits ×40 · ₹${po.total.toLocaleString('en-IN')}`, todayAt(15, 0));
    notifyUser(U.nilesh, 'info', 'box', 'PRP kits below reorder level', '8 left · reorder at 15', todayAt(8, 30));
  });
  ev(todayAt(15, 5), async () => {
    const po = await M.PurchaseOrder.create({ poNo: nextCode.po(), supplierId: S.shree.id, status: 'approval', eta: T.addDays(SOD, 3), total: 300 * P['N95-001'].purchasePrice, createdBy: U.rahul.id, createdAt: todayAt(15, 5) });
    await M.PurchaseOrderItem.create({ poId: po.id, productId: P['N95-001'].id, qty: 300, unitPrice: P['N95-001'].purchasePrice });
    await writeApproval({ type: 'purchase', maker: U.rahul, when: todayAt(15, 5), valueImpact: po.total, refType: 'purchase_order', refId: po.id, reason: 'Below reorder level', title: 'Purchase request', subtitle: `N95 masks ×300 · ${S.shree.name}`, payload: { poNo: po.poNo } });
  });
  ev(todayAt(18, 15), async () => {
    const lines = [['BIO-10K', 60], ['FIN-001', 50], ['PAN-040', 20], ['DUT-005', 10]];
    const total = lines.reduce((s, [sku, q]) => s + q * P[sku].purchasePrice, 0);
    const po = await M.PurchaseOrder.create({ poNo: nextCode.po(), supplierId: S.bihar.id, status: 'ordered', eta: T.addDays(SOD, 3), total, placedAt: todayAt(18, 15), createdBy: U.rahul.id, approvedBy: U.nilesh.id, createdAt: todayAt(16, 0) });
    await M.PurchaseOrderItem.bulkCreate(lines.map(([sku, qty]) => ({ poId: po.id, productId: P[sku].id, qty, unitPrice: P[sku].purchasePrice })));
    const a = await writeApproval({ type: 'purchase', maker: U.rahul, when: todayAt(16, 0), status: 'approved', checker: U.nilesh, decidedAt: todayAt(18, 15), valueImpact: total, refType: 'purchase_order', refId: po.id, reason: 'Below reorder level', title: 'Purchase request', subtitle: `Biotin 10k ×60 + 3 lines · ${S.bihar.name}`, payload: { poNo: po.poNo }, checkerNote: 'OK' });
    audit(U.nilesh, 'approvals', 'purchase.approved', `approved ${a.code}`, `Biotin 10k ×60 · ₹${total.toLocaleString('en-IN')}`, todayAt(18, 15));
    notifyUser(U.rahul, 'approval', 'check', `${a.code} approved`, `${po.poNo} placed with Bihar Pharma`, todayAt(18, 15), false, `approval:${a.id}`);
  });

  // Ready-to-bill after evening dispense
  ev(todayAt(19, 42), async () => {
    const p = randomPatient();
    const { rx } = await writeVisit({ when: todayAt(19, 25), patient: p, kind: 'consult', items: [['FIN-001', 2]], doctor: U.ankita, dispenser: U.priya, dispenseAt: todayAt(19, 42), status: 'dispensed', logAudit: true });
    notifyUser(U.neha, 'info', 'receipt', `Ready to bill · ${rx.rxNo}`, `${p.code} ${p.name} · dispensed by Priya`, todayAt(19, 42), false, `rx:${rx.id}`);
  });

  // Live queue: new OT prescription + PRP session waiting
  ev(minsAgo(9), async () => {
    const { rx } = await writeVisit({ when: minsAgo(9), patient: PT.ankit, kind: 'prp', items: [['PRP-K10', 1], ['LID-200', 1]], doctor: U.ankita, status: 'pending', setting: 'OPD' });
    notifyUser(U.priya, 'info', 'pill', `New prescription ${rx.rxNo}`, `${PT.ankit.code} · Ankit Kumar · 2 items`, minsAgo(9));
  });
  ev(minsAgo(2), async () => {
    const { rx } = await writeVisit({ when: minsAgo(2), patient: PT.rohit, kind: 'fue', setting: 'OT', items: [['LID-230', 4], ['NS-500', 2], ['HTS-100', 1], ['CFT-001', 2], ['KET-030', 2]], doctor: U.nilesh, status: 'pending' });
    await rx.update({ procedure: 'FUE · 2,800 grafts' });
    notifyUser(U.priya, 'critical', 'pill', `New OT prescription ${rx.rxNo}`, `${PT.rohit.code} · Rohit Srivastava · 5 items`, minsAgo(2));
  });

  todayEvents.sort((a, b) => a.when - b.when);
  for (const e of todayEvents) await e.fn();

  // ---------- open purchase orders ----------
  const late = await M.PurchaseOrder.create({ poNo: nextCode.po(), supplierId: S.surgimax.id, status: 'ordered', eta: T.addDays(SOD, -3), total: 50 * P['SPH-08'].purchasePrice, placedAt: T.addDays(NOW, -8), createdBy: U.rahul.id, approvedBy: U.nilesh.id, createdAt: T.addDays(NOW, -8) });
  await M.PurchaseOrderItem.create({ poId: late.id, productId: P['SPH-08'].id, qty: 50, unitPrice: P['SPH-08'].purchasePrice });
  const medLines = [['MNX-005', 24], ['KET-030', 20], ['HTS-100', 6], ['NS-500', 60], ['GLV-07', 100], ['LID-230', 20], ['CFT-001', 40], ['DEX-004', 40]];
  const medTotal = medLines.reduce((s, [sku, q]) => s + q * P[sku].purchasePrice, 0);
  const medPo = await M.PurchaseOrder.create({ poNo: nextCode.po(), supplierId: S.medline.id, status: 'on_the_way', eta: new Date(SOD.getTime() + 14 * 60 * MIN), total: medTotal, placedAt: T.addDays(NOW, -3), createdBy: U.rahul.id, approvedBy: U.nilesh.id, createdAt: T.addDays(NOW, -3) });
  await M.PurchaseOrderItem.bulkCreate(medLines.map(([sku, qty]) => ({ poId: medPo.id, productId: P[sku].id, qty, unitPrice: P[sku].purchasePrice })));
  const draftPo = await M.PurchaseOrder.create({ poNo: nextCode.po(), supplierId: S.apex.id, status: 'draft', total: 5 * P['GFC-KIT'].purchasePrice, createdBy: U.rahul.id, eta: T.addDays(SOD, 4) });
  await M.PurchaseOrderItem.create({ poId: draftPo.id, productId: P['GFC-KIT'].id, qty: 5, unitPrice: P['GFC-KIT'].purchasePrice });

  // Draft GRN against the Medline PO — partly checked, ready to finish.
  const draftGrn = await M.Grn.create({ grnNo: nextCode.grn(), poId: medPo.id, supplierId: S.medline.id, invoiceNo: `MD/${String(T.toIst(NOW).getUTCFullYear()).slice(2)}/8812`, invoiceDate: T.dateOnly(), status: 'draft', orderedValue: medTotal, receivedBy: U.rahul.id });
  const grnPrefill = { 'MNX-005': ['MX-2411', 335, 24], 'KET-030': ['KT-2410', 270, 18], 'HTS-100': ['HT-2410', 150, 6, 4.2] };
  await M.GrnItem.bulkCreate(medLines.map(([sku, qty]) => {
    const pre = grnPrefill[sku];
    return { grnId: draftGrn.id, productId: P[sku].id, orderedQty: qty, unitCost: P[sku].purchasePrice, batchNo: pre ? pre[0] : null, expiryDate: pre ? expIn(pre[1]) : null, receivedQty: pre ? pre[2] : 0, tempC: pre && pre[3] ? pre[3] : null, checked: !!pre };
  }));

  // ---------- counts: one running blind count, one scheduled ----------
  const rackB = inLoc('Rack B');
  const countedPlan = { 'LD-2407': 21, 'KT-2312': 18, 'CF-2402': 32, 'DX-2311': 40, 'BP-2309': 0, 'LD-2310': 4, 'TA-2305': 8 };
  await writeCount({ daysAgo: 0, h: 18, m: 10, n: 3, area: 'Rack B · Injectables', prefix: 'Rack B', counter: U.rahul, second: U.priya, status: 'in_progress',
    lines: rackB.map((b) => ({ batch: b, counted: countedPlan[b.batchNo], recount: b.batchNo === 'KT-2312' })) });
  await M.StockCount.create({ code: countCode(NOW, 4), area: 'Rack A · Oral medicines', locationPrefix: 'Rack A', counterId: U.rahul.id, secondCounterId: U.sunil.id, status: 'scheduled', scheduledAt: new Date(SOD.getTime() + 17 * 60 * MIN) });

  // ---------- sessions ----------
  const sess = (u, deviceName, platform, last) => M.Session.create({ userId: u.id, deviceName, platform, location: 'Patna', refreshHash: sha(crypto.randomBytes(16).toString('hex')), expiresAt: T.addDays(NOW, 6), lastActiveAt: last, createdAt: T.addDays(last, -1) });
  await sess(U.nilesh, 'iPad 10 · Reception', 'ios', minsAgo(14));
  await sess(U.nilesh, 'Chrome · Windows', 'web', at(1, 19, 6));
  await sess(U.rahul, 'Redmi Note 13 · Nexgen app', 'android', minsAgo(5));
  await sess(U.priya, 'Galaxy A35 · Nexgen app', 'android', minsAgo(3));
  await sess(U.neha, 'iPad 10 · Reception', 'ios', minsAgo(6));

  // ---------- older notifications & audit trail ----------
  notifyUser(U.nilesh, 'info', 'userplus', 'Sunil Paswan joined', 'Dispensing Staff · invite accepted', at(2, 10, 5), true, `staff:${U.sunil.id}`);
  notifyUser(U.nilesh, 'info', 'device', 'New sign-in on iPad 10', 'Reception · Patna', at(2, 9, 12), true, 'security');
  audit(U.sunil, 'staff', 'invite.accepted', 'accepted invite', 'Dispensing Staff', at(2, 10, 5));
  audit(U.nilesh, 'staff', 'staff.invited', 'invited Ritika Singh', 'Billing / Reception', at(2, 11, 0));
  audit(U.nilesh, 'staff', 'staff.updated', 'deactivated Sanjay Yadav', 'access revoked', T.addDays(NOW, -16));

  await M.Notification.bulkCreate(notifications);
  await M.AuditLog.bulkCreate(audits.sort((a, b) => a.createdAt - b.createdAt));
  await alerts.runChecks();

  // ---------- valuation history & recent exports ----------
  const [{ value }] = await M.sequelize.query("SELECT COALESCE(SUM(qty*cost_price),0)::float AS value FROM batches WHERE status<>'written_off' AND qty>0", { type: M.sequelize.QueryTypes.SELECT });
  const snaps = [];
  for (let w = 12; w >= 1; w -= 1) snaps.push({ date: T.dateOnly(T.addDays(NOW, -w * 7)), value: Math.round(value * (0.86 + (12 - w) * 0.011 + rand() * 0.02)), units: null });
  snaps.push({ date: T.dateOnly(T.addDays(NOW, -30)), value: Math.round(value / 1.042), units: null });
  const uniq = Object.values(Object.fromEntries(snaps.map((s) => [s.date, s])));
  await M.ValuationSnapshot.bulkCreate(uniq);
  await M.ReportExport.bulkCreate([
    { name: 'Expiry register · last month.pdf', reportType: 'expiry_register', format: 'pdf', sizeBytes: 219136, userId: U.nilesh.id, createdAt: at(1, 18, 2) },
    { name: 'Movement ledger · last week.xlsx', reportType: 'movement_ledger', format: 'xlsx', sizeBytes: 1258291, userId: U.nilesh.id, createdAt: at(2, 9, 45) },
  ]);

  // ---------- sequences continue after seeded numbers ----------
  const seqs = { ...counters, patient: 2060 };
  Object.entries(approvalCounters).forEach(([k, v]) => { seqs[`approval_${k}`] = v; });
  const ist = T.toIst(NOW);
  seqs[`count_${pad(ist.getUTCMonth() + 1, 2)}${pad(ist.getUTCDate(), 2)}`] = 4;
  await M.Sequence.bulkCreate(Object.entries(seqs).map(([name, v]) => ({ name, value: v })));

  const counts = {
    products: await M.Product.count(), batches: await M.Batch.count(), invoices: await M.Invoice.count(), prescriptions: await M.Prescription.count(),
    grns: await M.Grn.count(), movements: await M.StockMovement.count(), approvals: await M.Approval.count(), audit: await M.AuditLog.count(),
  };
  console.log('\nSeed complete:', counts);
  console.log(`\nDemo logins (password for all: ${DEMO_PASSWORD})`);
  cat.staff.filter((s) => !s.status).forEach((s) => console.log(`  ${s.role.padEnd(18)} ${s.email}`));
  console.log(`  Invited (accept with code ${DEMO_INVITE_CODE}): ritika@nexgenhair.in\n`);
}

main()
  .catch((err) => { console.error(err); process.exitCode = 1; })
  .finally(() => M.sequelize.close());
