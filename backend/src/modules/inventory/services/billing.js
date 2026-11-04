const { Invoice, InvoiceItem, SaleReturn, SaleReturnItem, Batch } = require('../models');
const { round2 } = require('../utils/http');
const stock = require('./stock');
const audit = require('./audit');

// lines: [{ qty, unitPrice, gstRate }]
function computeTotals(lines) {
  const subtotal = round2(lines.reduce((s, l) => s + l.qty * l.unitPrice, 0));
  const gstAmount = round2(lines.reduce((s, l) => s + (l.qty * l.unitPrice * Number(l.gstRate)) / 100, 0));
  const raw = round2(subtotal + gstAmount);
  const total = Math.round(raw);
  return { subtotal, gstAmount, roundOff: round2(total - raw), total };
}

const lineRefund = (item, qty) => Math.round(qty * item.unitPrice * (1 + Number(item.gstRate) / 100));

// Restock returned items, write the credit note and update invoice status.
async function finalizeSaleReturn(saleReturn, user, transaction) {
  const items = await SaleReturnItem.findAll({ where: { saleReturnId: saleReturn.id }, include: [{ model: InvoiceItem, as: 'invoiceItem' }], transaction });
  for (const it of items) {
    await it.invoiceItem.increment('returnedQty', { by: it.qty, transaction });
    if (it.restock && it.batchId) {
      const batch = await Batch.findByPk(it.batchId, { transaction, lock: true });
      await stock.applyMovement({ batch, qty: it.qty, type: 'sale_return', user, refType: 'sale_return', refNo: saleReturn.code, note: saleReturn.reason, transaction });
    }
  }
  const invoice = await Invoice.findByPk(saleReturn.invoiceId, { include: [{ model: InvoiceItem, as: 'items' }], transaction });
  const allBack = invoice.items.every((i) => i.returnedQty >= i.qty);
  invoice.status = allBack ? 'returned' : 'part_return';
  await invoice.save({ transaction });
  saleReturn.status = 'completed';
  await saleReturn.save({ transaction });
  await audit.log({ user, category: 'billing', action: 'sale_return.completed', message: `processed return ${saleReturn.code}`, detail: `${invoice.invNo} · ₹${saleReturn.amount} · ${saleReturn.refundMethod}`, transaction });
  return saleReturn;
}

module.exports = { computeTotals, lineRefund, finalizeSaleReturn, SaleReturn };
