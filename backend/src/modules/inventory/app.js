const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const { authenticate } = require('./middleware/auth');
const { notFoundHandler, errorHandler } = require('./middleware/errors');

// Mounted at /api by the clinic backend (src/app.ts); keeps its own helmet, CORS and error shape.
const app = express();
// One hop (nginx). `true` would let clients spoof X-Forwarded-For in the audit log.
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','), credentials: true }));
app.use(express.json({ limit: '2mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true, name: 'Nexgen Inventory API', time: new Date() }));

app.use('/auth', require('./routes/auth'));
app.use(authenticate);
app.use(require('./routes/admin'));
app.use(require('./routes/inventory'));
app.use(require('./routes/purchasing'));
app.use(require('./routes/counts'));
app.use(require('./routes/dispensing'));
app.use(require('./routes/billing'));
app.use(require('./routes/reports'));

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
