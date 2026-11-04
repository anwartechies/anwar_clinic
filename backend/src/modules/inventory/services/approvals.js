const { Approval, PurchaseOrder, SaleReturn, StockCountItem, User, Product, Batch, sequelize } = require('../models');
const { badRequest, forbidden, conflict, notFound } = require('../utils/http');
const { codes } = require('./sequence');
const stock = require('./stock');
const audit = require('./audit');
const { notify } = require('./notify');
const billing = require('./billing');

const TYPE_LABEL = {
  adjustment: 'Stock adjustment',
  purchase: 'Purchase request',
  write_off: 'Expired write-off',
  wastage: 'Wastage request',
  refund: 'Refund',
};

async function create({ type, maker, transaction, ...fields }) {
  const code = await codes.approval(type, transaction);
  const approval = await Approval.create({ type, code, makerId: maker.id, ...fields }, { transaction });
  await audit.log({
    user: maker, category: 'approvals', action: `${type}.requested`,
    message: `requested ${TYPE_LABEL[type].toLowerCase()} ${code}`, detail: fields.subtitle || fields.title, transaction,
  });
  await notify({
    roles: ['super_admin'], type: 'approval', icon: 'check',
    title: `${TYPE_LABEL[type]} needs approval`, body: `${code} · ${fields.subtitle || ''} · by ${maker.name}`,
    link: `approval:${approval.id}`, transaction,
  });
  return approval;
}

async function applyEffects(approval, checker, t) {
  const ref = approval.code;
  switch (approval.type) {
    case 'adjustment':
      await stock.applyMovement({ batch: approval.batchId, qty: approval.qtyChange, type: 'adjustment', user: approval.makerId, refType: 'approval', refNo: ref, note: approval.reason, transaction: t });
      await StockCountItem.update({ resolution: 'resolved' }, { where: { approvalId: approval.id }, transaction: t });
      break;
    case 'wastage':
      await stock.applyMovement({ batch: approval.batchId, qty: approval.qtyChange, type: 'wastage', user: approval.makerId, refType: 'approval', refNo: ref, note: approval.reason, transaction: t });
      break;
    case 'write_off':
      for (const line of approval.payload.batches || []) {
        const batch = await Batch.findByPk(line.batchId, { transaction: t, lock: true });
        if (batch && batch.qty > 0) {
          await stock.applyMovement({ batch, qty: -batch.qty, type: 'write_off', user: approval.makerId, refType: 'approval', refNo: ref, note: approval.reason, transaction: t });
        }
      }
      break;
    case 'purchase': {
      const po = await PurchaseOrder.findByPk(approval.refId, { transaction: t });
      if (po) await po.update({ status: 'ordered', placedAt: new Date(), approvedBy: checker.id }, { transaction: t });
      break;
    }
    case 'refund': {
      const sr = await SaleReturn.findByPk(approval.refId, { transaction: t });
      if (sr) await billing.finalizeSaleReturn(sr, checker, t);
      break;
    }
    default:
      break;
  }
}

async function rejectEffects(approval, t) {
  if (approval.type === 'purchase') await PurchaseOrder.update({ status: 'rejected' }, { where: { id: approval.refId }, transaction: t });
  if (approval.type === 'refund') await SaleReturn.update({ status: 'rejected' }, { where: { id: approval.refId }, transaction: t });
  if (approval.type === 'adjustment') await StockCountItem.update({ resolution: 'checking' }, { where: { approvalId: approval.id }, transaction: t });
}

async function decide(id, checker, decision, checkerNote) {
  if (!['approve', 'reject'].includes(decision)) throw badRequest('decision must be approve or reject');
  return sequelize.transaction(async (t) => {
    const approval = await Approval.findByPk(id, { transaction: t, lock: true });
    if (!approval) throw notFound('Approval');
    if (approval.status !== 'pending') throw conflict(`Already ${approval.status}`);
    if (approval.makerId === checker.id) throw forbidden('Maker cannot approve their own request');
    if (decision === 'reject' && !checkerNote) throw badRequest('A checker note is required to reject');

    if (decision === 'approve') await applyEffects(approval, checker, t);
    else await rejectEffects(approval, t);

    await approval.update({ status: decision === 'approve' ? 'approved' : 'rejected', checkerId: checker.id, checkerNote, decidedAt: new Date() }, { transaction: t });
    await audit.log({
      user: checker, category: 'approvals', action: `${approval.type}.${decision}d`,
      message: `${decision}d ${approval.code}`, detail: `${approval.subtitle || approval.title}${checkerNote ? ` · "${checkerNote}"` : ''}`, transaction: t,
    });
    await notify({
      userIds: [approval.makerId], type: 'approval', icon: decision === 'approve' ? 'check' : 'x',
      title: `${approval.code} ${decision === 'approve' ? 'approved' : 'rejected'}`,
      body: `${approval.subtitle || approval.title} · by ${checker.name}`, link: `approval:${approval.id}`, transaction: t,
    });
    return approval;
  });
}

const include = [
  { model: User, as: 'maker', attributes: ['id', 'name', 'role', 'avatarBg', 'avatarFg'] },
  { model: User, as: 'checker', attributes: ['id', 'name'] },
  { model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'unit', 'location'] },
  { model: Batch, as: 'batch', attributes: ['id', 'batchNo', 'expiryDate', 'location', 'qty'] },
];

module.exports = { create, decide, include, TYPE_LABEL };
