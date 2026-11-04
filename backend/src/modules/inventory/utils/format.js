// Indian number formatting: 1842650 -> ₹18,42,650
function inr(n, { decimals = 0, symbol = true } = {}) {
  const v = Number(n || 0);
  const s = Math.abs(v).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return `${v < 0 ? '−' : ''}${symbol ? '₹' : ''}${s}`;
}
const pad = (n, w = 4) => String(n).padStart(w, '0');
const maskPhone = (p = '') => {
  const d = p.replace(/\D/g, '').slice(-10);
  return d.length === 10 ? `+91 ${d.slice(0, 2)}••• ••${d.slice(7)}` : p;
};
module.exports = { inr, pad, maskPhone };
