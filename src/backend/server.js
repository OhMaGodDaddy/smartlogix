const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const { errorHandler, describeError } = require('./lib/http');
const { migrate } = require('./lib/migrate');
const { refreshOverdue } = require('./lib/overdue');
const { purgeDemoData } = require('./lib/purgeDemoData');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins.includes('*') ? '*' : allowedOrigins }));
app.use(express.json({ limit: '1mb' }));

let dbReady = false;
let dbError = null;

// Always answers 200 so Railway's health check passes while the database is still connecting.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SmartLogix API Gateway', database: dbReady ? 'connected' : 'connecting', dbError, uptime: process.uptime() });
});

app.get('/', (req, res) => {
  res.json({
    name: 'SmartLogix Unified API Gateway',
    version: '1.0.0',
    database: dbReady ? 'connected' : 'connecting',
    endpoints: ['/health', '/api/auth/users', '/api/inventory/*', '/api/vehicles/vehicles', '/api/notifications/logs']
  });
});

app.use('/api', (req, res, next) => {
  if (dbReady) return next();
  res.status(503).json({ error: 'The database is not connected yet. Please try again in a few seconds.' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/notifications', require('./routes/notifications'));

app.use('/api', (req, res) => res.status(404).json({ error: `No such endpoint: ${req.method} ${req.originalUrl}` }));
app.use(errorHandler);

async function connectDatabase() {
  try {
    console.log('[SmartLogix] Connecting to PostgreSQL...');
    await sequelize.authenticate();
    await sequelize.sync();
    await migrate(sequelize);
    if (process.env.PURGE_DEMO_DATA === 'true') await purgeDemoData();
    dbReady = true;
    dbError = null;
    console.log('[SmartLogix] Database ready.');
  } catch (err) {
    dbError = describeError(err);
    console.error(`[SmartLogix] Database connection failed: ${dbError}. Retrying in 10s.`);
    setTimeout(connectDatabase, 10000);
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SmartLogix] API gateway listening on port ${PORT}`);
  connectDatabase();
});

// Flag overdue loans (and notify) even when nobody is looking at the logbook.
setInterval(() => {
  if (dbReady) refreshOverdue().catch((err) => console.error('[SmartLogix] Overdue check failed:', describeError(err)));
}, 5 * 60 * 1000);
