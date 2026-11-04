// Permission catalogue. Enforced on the server by middleware/auth.js `can()`.
const ROLES = ['super_admin', 'inventory_manager', 'dispensing', 'billing', 'clinician'];

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  inventory_manager: 'Inventory Manager',
  dispensing: 'Dispensing Staff',
  billing: 'Billing / Reception',
  clinician: 'Clinician',
};

// `locked: 'super_admin'` = only Super Admin can ever hold it; `locked: 'none'` = no role can.
const PERMISSIONS = [
  { key: 'stock.view', group: 'Inventory', label: 'View stock & batches' },
  { key: 'product.manage', group: 'Inventory', label: 'Create / edit products' },
  { key: 'grn.receive', group: 'Inventory', label: 'Receive stock (GRN)' },
  { key: 'adjustment.request', group: 'Inventory', label: 'Request stock adjustment', hint: 'Goes to maker-checker' },
  { key: 'count.perform', group: 'Inventory', label: 'Run physical stock counts' },
  { key: 'adjustment.approve', group: 'Inventory', label: 'Approve adjustments & write-offs', hint: 'Super Admin only', locked: 'super_admin' },

  { key: 'purchase.request', group: 'Purchasing', label: 'Raise purchase requests' },
  { key: 'supplier.manage', group: 'Purchasing', label: 'Manage suppliers' },
  { key: 'po.approve_high', group: 'Purchasing', label: 'Approve POs above ₹10,000' },

  { key: 'rx.view', group: 'Dispensing', label: 'View prescription queue' },
  { key: 'rx.create', group: 'Dispensing', label: 'Write prescriptions' },
  { key: 'dispense.perform', group: 'Dispensing', label: 'Pick & dispense against Rx' },
  { key: 'return.request', group: 'Dispensing', label: 'Return stock / report wastage' },

  { key: 'invoice.create', group: 'Billing', label: 'Create invoices' },
  { key: 'invoice.view', group: 'Billing', label: 'View invoices' },
  { key: 'payment.collect', group: 'Billing', label: 'Collect payments' },
  { key: 'sale_return.create', group: 'Billing', label: 'Process sale returns' },
  { key: 'refund.approve', group: 'Billing', label: 'Approve refunds above ₹2,000', hint: 'Super Admin only', locked: 'super_admin' },

  { key: 'reports.stock', group: 'Reports & audit', label: 'Stock & expiry reports' },
  { key: 'reports.cost', group: 'Reports & audit', label: 'View cost & margin' },
  { key: 'audit.own', group: 'Reports & audit', label: 'View audit log', hint: 'Own actions only' },
  { key: 'audit.all', group: 'Reports & audit', label: 'View full audit log', hint: 'Super Admin only', locked: 'super_admin' },
  { key: 'history.edit', group: 'Reports & audit', label: 'Edit or delete history', hint: 'Not available to any role', locked: 'none' },

  { key: 'staff.view', group: 'Staff & settings', label: 'View staff directory' },
  { key: 'staff.manage', group: 'Staff & settings', label: 'Invite & manage staff', hint: 'Super Admin only', locked: 'super_admin' },
  { key: 'settings.manage', group: 'Staff & settings', label: 'Change thresholds & settings', hint: 'Super Admin only', locked: 'super_admin' },
];

const DEFAULT_ROLE_PERMISSIONS = {
  super_admin: PERMISSIONS.filter((p) => p.locked !== 'none').map((p) => p.key),
  inventory_manager: [
    'stock.view', 'product.manage', 'grn.receive', 'adjustment.request', 'count.perform',
    'purchase.request', 'supplier.manage', 'rx.view', 'reports.stock', 'audit.own', 'staff.view',
    'return.request', 'invoice.view', 'dispense.perform',
  ],
  dispensing: ['stock.view', 'rx.view', 'dispense.perform', 'return.request', 'count.perform', 'audit.own'],
  billing: ['stock.view', 'invoice.create', 'invoice.view', 'payment.collect', 'sale_return.create', 'rx.view', 'audit.own'],
  clinician: ['stock.view', 'rx.view', 'rx.create', 'audit.own'],
};

module.exports = { ROLES, ROLE_LABELS, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS };
