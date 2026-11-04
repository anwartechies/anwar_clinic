const pg = require('pg');
const { Sequelize, DataTypes: T } = require('sequelize');
const config = require('../config');
const { ROLES } = require('../config/permissions');

// Return NUMERIC and COUNT(*) as JS numbers instead of strings.
pg.types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v)));
pg.types.setTypeParser(20, (v) => (v === null ? null : parseInt(v, 10)));

const sequelize = new Sequelize(config.db.url, {
  dialect: 'postgres',
  logging: false,
  // search_path also covers the raw SQL in services/; define.schema covers sync and enums.
  define: { underscored: true, schema: config.db.schema },
  dialectOptions: {
    options: `-c search_path=${config.db.schema}`,
    ...(config.db.url.includes('.rds.amazonaws.com') && { ssl: { require: true, rejectUnauthorized: false } }),
  },
});

const money = () => ({ type: T.DECIMAL(12, 2), allowNull: false, defaultValue: 0 });
const enumOf = (...values) => ({ type: T.ENUM(...values) });

const User = sequelize.define('User', {
  name: { type: T.STRING, allowNull: false },
  email: { type: T.STRING, unique: true },
  phone: { type: T.STRING, unique: true },
  passwordHash: T.STRING,
  role: { ...enumOf(...ROLES), allowNull: false },
  title: T.STRING, // e.g. "Owner", "Prescriber"
  status: { ...enumOf('active', 'invited', 'inactive'), defaultValue: 'active' },
  avatarBg: { type: T.STRING, defaultValue: '#E7EBFF' },
  avatarFg: { type: T.STRING, defaultValue: '#1B34C4' },
  shiftOnly: { type: T.BOOLEAN, defaultValue: false },
  shiftStart: { type: T.STRING, defaultValue: '09:00' },
  shiftEnd: { type: T.STRING, defaultValue: '19:00' },
  shiftDays: { type: T.ARRAY(T.INTEGER), defaultValue: [1, 2, 3, 4, 5, 6] }, // 0 = Sunday
  otpNewDevice: { type: T.BOOLEAN, defaultValue: true },
  biometricUnlock: { type: T.BOOLEAN, defaultValue: true },
  autoLock: { type: T.BOOLEAN, defaultValue: true },
  twoStep: { type: T.BOOLEAN, defaultValue: true },
  lastSeenAt: T.DATE,
  failedAttempts: { type: T.INTEGER, defaultValue: 0 },
  lockedUntil: T.DATE,
  inviteCodeHash: T.STRING,
  inviteExpiresAt: T.DATE,
  invitedAt: T.DATE,
  deactivatedAt: T.DATE,
  passwordHistory: { type: T.JSONB, defaultValue: [] },
}, {
  defaultScope: { attributes: { exclude: ['passwordHash', 'passwordHistory', 'inviteCodeHash'] } },
  scopes: { withSecrets: {} },
});
User.prototype.initials = function initials() {
  return this.name.replace(/^Dr\.?\s+/i, '').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
};

const RolePermission = sequelize.define('RolePermission', {
  role: { type: T.STRING, primaryKey: true },
  permissions: { type: T.JSONB, defaultValue: [] },
});

const Session = sequelize.define('Session', {
  id: { type: T.UUID, defaultValue: T.UUIDV4, primaryKey: true },
  deviceName: T.STRING,
  platform: T.STRING, // android | ios | web
  location: { type: T.STRING, defaultValue: 'Patna' },
  ip: T.STRING,
  refreshHash: T.STRING,
  expiresAt: T.DATE,
  lastActiveAt: T.DATE,
  revokedAt: T.DATE,
});

const PasswordReset = sequelize.define('PasswordReset', {
  codeHash: T.STRING,
  expiresAt: T.DATE,
  verifiedAt: T.DATE,
  usedAt: T.DATE,
  attempts: { type: T.INTEGER, defaultValue: 0 },
});

const Sequence = sequelize.define('Sequence', {
  name: { type: T.STRING, primaryKey: true },
  value: { type: T.INTEGER, defaultValue: 0 },
}, { timestamps: false });

const Setting = sequelize.define('Setting', {
  key: { type: T.STRING, primaryKey: true },
  value: T.JSONB,
});

const Supplier = sequelize.define('Supplier', {
  code: T.STRING,
  name: { type: T.STRING, allowNull: false },
  city: T.STRING,
  categories: T.STRING,
  contactName: T.STRING,
  phone: T.STRING,
  email: T.STRING,
  gstin: T.STRING,
  onTimePct: { type: T.INTEGER, defaultValue: 90 },
  fillRatePct: { type: T.INTEGER, defaultValue: 95 },
  leadDays: { type: T.DECIMAL(4, 1), defaultValue: 3 },
  coldChain: { type: T.BOOLEAN, defaultValue: false },
  active: { type: T.BOOLEAN, defaultValue: true },
});

const Product = sequelize.define('Product', {
  sku: { type: T.STRING, unique: true },
  name: { type: T.STRING, allowNull: false },
  type: { ...enumOf('medicine', 'consumable', 'prp', 'instrument', 'ppe', 'other'), defaultValue: 'medicine' },
  category: T.STRING,
  unit: { type: T.STRING, defaultValue: 'unit' }, // strip, vial, bottle, kit, pair...
  packInfo: T.STRING,
  brand: T.STRING,
  manufacturer: T.STRING,
  barcode: T.STRING,
  minLevel: { type: T.INTEGER, defaultValue: 10 },
  reorderQty: { type: T.INTEGER, defaultValue: 20 },
  purchasePrice: money(),
  sellingPrice: money(),
  gstRate: { type: T.DECIMAL(5, 2), defaultValue: 12 },
  rxRequired: { type: T.BOOLEAN, defaultValue: false },
  coldChain: { type: T.BOOLEAN, defaultValue: false },
  storage: T.STRING,
  location: T.STRING,
  status: { ...enumOf('draft', 'active', 'archived'), defaultValue: 'active' },
});

const Batch = sequelize.define('Batch', {
  batchNo: { type: T.STRING, allowNull: false },
  barcode: T.STRING,
  expiryDate: { type: T.DATEONLY, allowNull: false },
  qty: { type: T.INTEGER, defaultValue: 0 },
  receivedQty: { type: T.INTEGER, defaultValue: 0 },
  costPrice: money(),
  location: T.STRING,
  status: { ...enumOf('active', 'quarantined', 'written_off'), defaultValue: 'active' },
  quarantineReason: T.STRING,
  receivedAt: T.DATE,
});

const StockMovement = sequelize.define('StockMovement', {
  type: { ...enumOf('grn', 'dispense', 'adjustment', 'return', 'wastage', 'sale', 'sale_return', 'write_off', 'reversal'), allowNull: false },
  qty: { type: T.INTEGER, allowNull: false },
  balanceAfter: T.INTEGER,
  unitCost: money(),
  refType: T.STRING,
  refNo: T.STRING,
  note: T.TEXT,
  afterHours: { type: T.BOOLEAN, defaultValue: false },
}, { updatedAt: false });

const Patient = sequelize.define('Patient', {
  code: { type: T.STRING, unique: true },
  name: { type: T.STRING, allowNull: false },
  phone: T.STRING,
  gender: T.STRING,
  age: T.INTEGER,
});

const Prescription = sequelize.define('Prescription', {
  rxNo: { type: T.STRING, unique: true },
  procedure: T.STRING,
  setting: { type: T.STRING, defaultValue: 'OPD' }, // OT | OPD
  priority: { ...enumOf('normal', 'urgent'), defaultValue: 'normal' },
  status: { ...enumOf('pending', 'in_progress', 'partial', 'dispensed', 'billed', 'cancelled'), defaultValue: 'pending' },
  notes: T.TEXT,
});

const PrescriptionItem = sequelize.define('PrescriptionItem', {
  qty: { type: T.INTEGER, allowNull: false },
  dispensedQty: { type: T.INTEGER, defaultValue: 0 },
  unavailable: { type: T.BOOLEAN, defaultValue: false },
  instructions: T.STRING,
});

const Dispense = sequelize.define('Dispense', {
  code: { type: T.STRING, unique: true },
  status: { ...enumOf('completed', 'reversed'), defaultValue: 'completed' },
  totalUnits: { type: T.INTEGER, defaultValue: 0 },
});

const DispenseItem = sequelize.define('DispenseItem', {
  qty: { type: T.INTEGER, allowNull: false },
}, { timestamps: false });

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  poNo: { type: T.STRING, unique: true },
  status: { ...enumOf('draft', 'approval', 'ordered', 'on_the_way', 'received', 'closed', 'rejected', 'cancelled'), defaultValue: 'draft' },
  eta: T.DATE,
  total: money(),
  placedAt: T.DATE,
  notes: T.TEXT,
});

const PurchaseOrderItem = sequelize.define('PurchaseOrderItem', {
  qty: { type: T.INTEGER, allowNull: false },
  unitPrice: money(),
  receivedQty: { type: T.INTEGER, defaultValue: 0 },
}, { timestamps: false });

const Grn = sequelize.define('Grn', {
  grnNo: { type: T.STRING, unique: true },
  invoiceNo: T.STRING,
  invoiceDate: T.DATEONLY,
  status: { ...enumOf('draft', 'posted'), defaultValue: 'draft' },
  orderedValue: money(),
  receivedValue: money(),
  postedAt: T.DATE,
  notes: T.TEXT,
});

const GrnItem = sequelize.define('GrnItem', {
  batchNo: T.STRING,
  expiryDate: T.DATEONLY,
  orderedQty: { type: T.INTEGER, defaultValue: 0 },
  receivedQty: { type: T.INTEGER, defaultValue: 0 },
  unitCost: money(),
  tempC: T.DECIMAL(4, 1),
  checked: { type: T.BOOLEAN, defaultValue: false },
}, { timestamps: false });

const Approval = sequelize.define('Approval', {
  code: { type: T.STRING, unique: true },
  type: { ...enumOf('adjustment', 'purchase', 'write_off', 'wastage', 'refund'), allowNull: false },
  status: { ...enumOf('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  title: T.STRING,
  subtitle: T.STRING,
  reasonCode: T.STRING, // count_correction | damage | expired | transfer | contaminated | dropped | leaking | other
  reason: T.STRING,
  note: T.TEXT,
  checkerNote: T.TEXT,
  qtyChange: T.INTEGER,
  systemQty: T.INTEGER,
  valueImpact: money(),
  refType: T.STRING,
  refId: T.INTEGER,
  payload: { type: T.JSONB, defaultValue: {} },
  decidedAt: T.DATE,
});

const Invoice = sequelize.define('Invoice', {
  invNo: { type: T.STRING, unique: true },
  subtotal: money(),
  gstAmount: money(),
  roundOff: money(),
  total: money(),
  paidAmount: money(),
  paymentMethod: enumOf('upi', 'cash', 'card', 'split', 'insurance'),
  paymentRef: T.STRING,
  status: { ...enumOf('paid', 'due', 'claim', 'part_return', 'returned'), defaultValue: 'paid' },
  issuedAt: T.DATE,
});

const InvoiceItem = sequelize.define('InvoiceItem', {
  qty: { type: T.INTEGER, allowNull: false },
  unitPrice: money(),
  unitCost: money(),
  gstRate: { type: T.DECIMAL(5, 2), defaultValue: 12 },
  amount: money(),
  returnedQty: { type: T.INTEGER, defaultValue: 0 },
}, { timestamps: false });

const Payment = sequelize.define('Payment', {
  method: enumOf('upi', 'cash', 'card', 'insurance'),
  amount: money(),
  ref: T.STRING,
}, { updatedAt: false });

const SaleReturn = sequelize.define('SaleReturn', {
  code: { type: T.STRING, unique: true },
  reason: T.STRING,
  refundMethod: T.STRING,
  amount: money(),
  status: { ...enumOf('completed', 'pending_approval', 'rejected'), defaultValue: 'completed' },
});

const SaleReturnItem = sequelize.define('SaleReturnItem', {
  qty: T.INTEGER,
  amount: money(),
  restock: { type: T.BOOLEAN, defaultValue: true },
}, { timestamps: false });

const StockCount = sequelize.define('StockCount', {
  code: { type: T.STRING, unique: true },
  area: T.STRING,
  locationPrefix: T.STRING,
  mode: { type: T.STRING, defaultValue: 'blind' },
  status: { ...enumOf('scheduled', 'in_progress', 'completed', 'submitted'), defaultValue: 'scheduled' },
  scheduledAt: T.DATE,
  startedAt: T.DATE,
  finishedAt: T.DATE,
});

const StockCountItem = sequelize.define('StockCountItem', {
  location: T.STRING,
  systemQty: T.INTEGER,
  countedQty: T.INTEGER,
  countedAt: T.DATE,
  recount: { type: T.BOOLEAN, defaultValue: false },
  resolution: { ...enumOf('open', 'checking', 'resolved'), defaultValue: 'open' },
}, { timestamps: false });

const Notification = sequelize.define('Notification', {
  type: { ...enumOf('critical', 'approval', 'info'), defaultValue: 'info' },
  icon: T.STRING,
  title: T.STRING,
  body: T.STRING,
  link: T.STRING,
  dedupeKey: T.STRING,
  readAt: T.DATE,
}, { updatedAt: false });

const AuditLog = sequelize.define('AuditLog', {
  category: { ...enumOf('stock', 'approvals', 'security', 'billing', 'staff', 'system'), allowNull: false },
  action: { type: T.STRING, allowNull: false },
  message: T.STRING,
  detail: T.STRING,
  flag: T.STRING,
  meta: { type: T.JSONB, defaultValue: {} },
  ip: T.STRING,
}, {
  updatedAt: false,
  hooks: {
    beforeUpdate() { throw new Error('Audit log is append-only'); },
    beforeDestroy() { throw new Error('Audit log is append-only'); },
    beforeBulkUpdate() { throw new Error('Audit log is append-only'); },
    beforeBulkDestroy(opts) { if (!opts.truncate) throw new Error('Audit log is append-only'); },
  },
});

const ValuationSnapshot = sequelize.define('ValuationSnapshot', {
  date: { type: T.DATEONLY, unique: true },
  value: money(),
  units: T.INTEGER,
}, { timestamps: false });

const ReportExport = sequelize.define('ReportExport', {
  name: T.STRING,
  reportType: T.STRING,
  format: T.STRING,
  sizeBytes: T.INTEGER,
}, { updatedAt: false });

// DECIMAL columns come back from pg as strings; expose them as numbers everywhere.
for (const model of Object.values(sequelize.models)) {
  for (const [name, attr] of Object.entries(model.rawAttributes)) {
    if (attr.type instanceof T.DECIMAL && !attr.get) {
      attr.get = function getNumber() {
        const v = this.getDataValue(name);
        return v === null || v === undefined ? v : Number(v);
      };
    }
  }
  model.refreshAttributes();
}

// ---------- associations ----------
User.hasMany(Session, { foreignKey: 'userId' }); Session.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(PasswordReset, { foreignKey: 'userId' }); PasswordReset.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Batch, { foreignKey: 'productId', as: 'batches' }); Batch.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Supplier.hasMany(Batch, { foreignKey: 'supplierId' }); Batch.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
Product.belongsTo(Supplier, { foreignKey: 'preferredSupplierId', as: 'preferredSupplier' });

StockMovement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
StockMovement.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });
StockMovement.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Batch.hasMany(StockMovement, { foreignKey: 'batchId', as: 'movements' });

Patient.hasMany(Prescription, { foreignKey: 'patientId' }); Prescription.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Prescription.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
Prescription.hasMany(PrescriptionItem, { foreignKey: 'prescriptionId', as: 'items' });
PrescriptionItem.belongsTo(Prescription, { foreignKey: 'prescriptionId' });
PrescriptionItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Dispense.belongsTo(Prescription, { foreignKey: 'prescriptionId', as: 'prescription' });
Prescription.hasMany(Dispense, { foreignKey: 'prescriptionId', as: 'dispenses' });
Dispense.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Dispense.hasMany(DispenseItem, { foreignKey: 'dispenseId', as: 'items' });
DispenseItem.belongsTo(Dispense, { foreignKey: 'dispenseId' });
DispenseItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
DispenseItem.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });

PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplierId', as: 'orders' });
PurchaseOrder.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
PurchaseOrder.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'poId', as: 'items' });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'poId' });
PurchaseOrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Grn.belongsTo(PurchaseOrder, { foreignKey: 'poId', as: 'po' });
PurchaseOrder.hasMany(Grn, { foreignKey: 'poId', as: 'grns' });
Grn.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
Grn.belongsTo(User, { foreignKey: 'receivedBy', as: 'receiver' });
Grn.hasMany(GrnItem, { foreignKey: 'grnId', as: 'items' });
GrnItem.belongsTo(Grn, { foreignKey: 'grnId' });
GrnItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Approval.belongsTo(User, { foreignKey: 'makerId', as: 'maker' });
Approval.belongsTo(User, { foreignKey: 'checkerId', as: 'checker' });
Approval.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Approval.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });

Invoice.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Invoice.belongsTo(Prescription, { foreignKey: 'prescriptionId', as: 'prescription' });
Invoice.belongsTo(Dispense, { foreignKey: 'dispenseId', as: 'dispense' });
Invoice.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId', as: 'items' });
Invoice.hasMany(Payment, { foreignKey: 'invoiceId', as: 'payments' });
Invoice.hasMany(SaleReturn, { foreignKey: 'invoiceId', as: 'returns' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId' });
InvoiceItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
InvoiceItem.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });
Payment.belongsTo(Invoice, { foreignKey: 'invoiceId' });
Payment.belongsTo(User, { foreignKey: 'receivedBy', as: 'receiver' });

SaleReturn.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });
SaleReturn.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
SaleReturn.hasMany(SaleReturnItem, { foreignKey: 'saleReturnId', as: 'items' });
SaleReturnItem.belongsTo(InvoiceItem, { foreignKey: 'invoiceItemId', as: 'invoiceItem' });
SaleReturnItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
SaleReturnItem.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });

StockCount.belongsTo(User, { foreignKey: 'counterId', as: 'counter' });
StockCount.belongsTo(User, { foreignKey: 'secondCounterId', as: 'secondCounter' });
StockCount.hasMany(StockCountItem, { foreignKey: 'stockCountId', as: 'items' });
StockCountItem.belongsTo(StockCount, { foreignKey: 'stockCountId', as: 'count' });
StockCountItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
StockCountItem.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });
StockCountItem.belongsTo(Approval, { foreignKey: 'approvalId', as: 'approval' });

Notification.belongsTo(User, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ReportExport.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize, Sequelize,
  User, RolePermission, Session, PasswordReset, Sequence, Setting,
  Supplier, Product, Batch, StockMovement,
  Patient, Prescription, PrescriptionItem, Dispense, DispenseItem,
  PurchaseOrder, PurchaseOrderItem, Grn, GrnItem, Approval,
  Invoice, InvoiceItem, Payment, SaleReturn, SaleReturnItem,
  StockCount, StockCountItem, Notification, AuditLog, ValuationSnapshot, ReportExport,
};
