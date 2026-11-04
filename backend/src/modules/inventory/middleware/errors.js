const { HttpError } = require('../utils/http');

function notFoundHandler(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message, details: err.details });
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
  }
  if (err.message === 'Audit log is append-only') return res.status(403).json({ error: err.message });
  console.error(err);
  return res.status(500).json({ error: 'Something went wrong on the server' });
}

module.exports = { notFoundHandler, errorHandler };
