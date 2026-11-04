const { Sequence } = require('../models');
const { pad } = require('../utils/format');
const { toIst } = require('../utils/time');

// Atomically bump a named counter (inside the caller's transaction when given).
async function next(name, transaction) {
  const [row] = await Sequence.findOrCreate({ where: { name }, defaults: { value: 0 }, transaction, lock: transaction ? true : undefined });
  await row.increment('value', { by: 1, transaction });
  await row.reload({ transaction });
  return row.value;
}

const yy = () => String(toIst().getUTCFullYear()).slice(2);

const codes = {
  invoice: async (t) => `INV-${await next('invoice', t)}`,
  rx: async (t) => `Rx-${await next('rx', t)}`,
  patient: async (t) => `PT-${await next('patient', t)}`,
  dispense: async (t) => `DSP-${yy()}-${pad(await next('dispense', t), 5)}`,
  po: async (t) => `PO-${pad(await next('po', t))}`,
  grn: async (t) => `GRN-${pad(await next('grn', t))}`,
  creditNote: async (t) => `CN-${pad(await next('credit_note', t))}`,
  approval: async (type, t) => {
    const prefix = { adjustment: 'ADJ', purchase: 'PR', write_off: 'WO', wastage: 'WS', refund: 'RF' }[type];
    return `${prefix}-${pad(await next(`approval_${type}`, t))}`;
  },
  count: async (t) => {
    const ist = toIst();
    const mmdd = `${pad(ist.getUTCMonth() + 1, 2)}${pad(ist.getUTCDate(), 2)}`;
    return `CS-${mmdd}-${pad(await next(`count_${mmdd}`, t), 2)}`;
  },
};

module.exports = { next, codes };
