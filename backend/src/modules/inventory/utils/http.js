class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const badRequest = (msg, details) => new HttpError(400, msg, details);
const unauthorized = (msg = 'Please sign in again') => new HttpError(401, msg);
const forbidden = (msg = 'You do not have permission to do this') => new HttpError(403, msg);
const notFound = (what = 'Record') => new HttpError(404, `${what} not found`);
const conflict = (msg) => new HttpError(409, msg);

// Pull required fields out of a body, throwing a 400 that lists every missing one.
function required(body, fields) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
  if (missing.length) throw badRequest(`Missing: ${missing.join(', ')}`, { missing });
  return body;
}

const int = (v, d = 0) => (Number.isFinite(Number(v)) ? parseInt(v, 10) : d);
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

module.exports = { HttpError, badRequest, unauthorized, forbidden, notFound, conflict, required, int, round2 };
