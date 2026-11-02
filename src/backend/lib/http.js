/**
 * Shared HTTP helpers for the SmartLogix API gateway.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

/** Wraps an async route handler so rejected promises reach the error middleware. */
const asyncRoute = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/** Copies only the listed keys, trimming strings and turning empty strings into null. */
function pickFields(source, keys) {
  const out = {};
  for (const key of keys) {
    if (source[key] === undefined) continue;
    let value = source[key];
    if (typeof value === 'string') value = value.trim();
    out[key] = value === '' ? null : value;
  }
  return out;
}

function describeError(err) {
  return err.message || (err.errors && err.errors[0] && err.errors[0].message) || err.code || String(err);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON' });
  }

  switch (err.name) {
    case 'SequelizeUniqueConstraintError': {
      const field = (err.errors && err.errors[0] && err.errors[0].path) || 'value';
      return res.status(409).json({ error: `A record with this ${field} already exists` });
    }
    case 'SequelizeValidationError':
      return res.status(400).json({ error: err.errors.map((e) => e.message).join('; ') });
    case 'SequelizeForeignKeyConstraintError':
      return res.status(409).json({ error: 'This record is referenced by other records and cannot be changed' });
    case 'SequelizeDatabaseError':
      // Typically malformed input such as an invalid date or enum value.
      console.error('[SmartLogix] Database error:', describeError(err));
      return res.status(400).json({ error: 'The database rejected this request. Please check the submitted values.' });
    default:
      console.error('[SmartLogix] Unhandled error:', err);
      return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { UUID_RE, HttpError, asyncRoute, pickFields, describeError, errorHandler };

