const express = require('express');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { sequelize, Asset, Reservation, Transaction } = require('../inventory-service/models');
const { UUID_RE, HttpError, asyncRoute, pickFields } = require('../lib/http');
const { notify, ROLES } = require('../lib/notify');
const { refreshOverdue } = require('../lib/overdue');

const router = express.Router();

const OPEN_LOAN_STATUSES = ['Released', 'Overdue'];
const SYSTEM_MANAGED_STATUSES = ['Borrowed', 'Reserved'];
const UNBOOKABLE_STATUSES = ['Maintenance', 'Lost', 'Unavailable', 'Inspection'];
const ASSET_FIELDS = [
  'assetTag', 'name', 'category', 'description', 'location',
  'condition', 'status', 'acquisitionDate', 'acquisitionCost'
];
const ASSET_ATTRS = ['id', 'assetTag', 'name', 'category', 'location'];

const slug = (value) => String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function findAsset(ref, options = {}) {
  const clauses = [{ qrCodeRef: ref }, { assetTag: ref }];
  if (UUID_RE.test(ref)) clauses.unshift({ id: ref });
  return Asset.findOne({ where: { [Op.or]: clauses }, ...options });
}

function parseDate(value, label) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) throw new HttpError(400, `${label} must be a valid date`);
  return date;
}

function receiptRef(trx) {
  return `REC-${trx.id.slice(0, 8).toUpperCase()}`;
}

function signHandoff(trx) {
  const payload = [trx.id, trx.assetId, trx.borrowerId, trx.releaseDate.toISOString()].join('|');
  const digest = crypto
    .createHmac('sha256', process.env.SIGNING_SECRET || 'smartlogix-dev-signing-secret')
    .update(payload)
    .digest('hex');
  return `SIG-${digest.slice(0, 24).toUpperCase()}`;
}

/** Puts a Reserved asset back on the shelf when it has no remaining approved reservations. */
async function releaseReservedAsset(assetId, t) {
  const asset = await Asset.findByPk(assetId, { transaction: t });
  if (!asset || asset.status !== 'Reserved') return;
  const stillBooked = await Reservation.count({
    where: { assetId, status: 'Approved', endDate: { [Op.gt]: new Date() } },
    transaction: t
  });
  if (!stillBooked) await asset.update({ status: 'Available' }, { transaction: t });
}

async function closeTransaction(trx, body, t) {
  if (!OPEN_LOAN_STATUSES.includes(trx.status)) {
    throw new HttpError(409, 'This loan has already been closed');
  }
  const condition = typeof body.conditionAtReturn === 'string' && body.conditionAtReturn.trim()
    ? body.conditionAtReturn.trim()
    : trx.conditionAtRelease;
  const note = typeof body.notes === 'string' ? body.notes.trim() : '';

  await trx.update({
    status: 'Returned',
    actualReturnDate: new Date(),
    conditionAtReturn: condition,
    notes: note ? [trx.notes, note].filter(Boolean).join('\n') : trx.notes
  }, { transaction: t });

  const asset = await Asset.findByPk(trx.assetId, { transaction: t });
  if (asset) {
    await asset.update({
      status: condition === 'Requires Repair' ? 'Maintenance' : 'Available',
      condition,
      currentHolderId: null,
      currentHolderName: null
    }, { transaction: t });
  }
  return asset;
}

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

router.get('/assets', asyncRoute(async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;
  res.json(await Asset.findAll({ where, order: [['createdAt', 'DESC']] }));
}));

router.get('/assets/:id', asyncRoute(async (req, res) => {
  const asset = await findAsset(req.params.id);
  if (!asset) throw new HttpError(404, 'Asset not found');
  res.json(asset);
}));

router.post('/assets', asyncRoute(async (req, res) => {
  const data = pickFields(req.body, ASSET_FIELDS);
  for (const [field, label] of [['name', 'Name'], ['category', 'Category'], ['location', 'Location']]) {
    if (!data[field]) throw new HttpError(400, `${label} is required`);
  }
  if (!data.condition) delete data.condition;
  if (!data.status) delete data.status;
  if (data.status && SYSTEM_MANAGED_STATUSES.includes(data.status)) {
    throw new HttpError(400, `Status "${data.status}" is set automatically when an asset is checked out or reserved`);
  }

  if (!data.assetTag) data.assetTag = `AST-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  data.qrCodeRef = `QR-${data.assetTag}`;

  res.status(201).json(await Asset.create(data));
}));

router.put('/assets/:id', asyncRoute(async (req, res) => {
  const asset = await findAsset(req.params.id);
  if (!asset) throw new HttpError(404, 'Asset not found');

  const data = pickFields(req.body, ASSET_FIELDS);
  delete data.assetTag; // the tag is printed on the QR label, so it never changes
  for (const field of ['name', 'category', 'location', 'condition', 'status']) {
    if (field in data && !data[field]) throw new HttpError(400, `${field} cannot be empty`);
  }

  if (data.status && data.status !== asset.status) {
    if (asset.status === 'Borrowed') throw new HttpError(409, 'Return the asset before changing its status');
    if (SYSTEM_MANAGED_STATUSES.includes(data.status)) {
      throw new HttpError(400, `Status "${data.status}" is set automatically when an asset is checked out or reserved`);
    }
  }

  res.json(await asset.update(data));
}));

router.delete('/assets/:id', asyncRoute(async (req, res) => {
  const asset = await findAsset(req.params.id);
  if (!asset) throw new HttpError(404, 'Asset not found');
  if (asset.status === 'Borrowed') throw new HttpError(409, 'This asset is currently on loan');

  const history = (await Transaction.count({ where: { assetId: asset.id } }))
    + (await Reservation.count({ where: { assetId: asset.id } }));
  if (history > 0) {
    throw new HttpError(409, 'This asset has loan or reservation history and cannot be deleted. Mark it Unavailable instead.');
  }

  await asset.destroy();
  res.status(204).end();
}));

router.post('/assets/:id/checkout', asyncRoute(async (req, res) => {
  const name = String(req.body.borrowerName || '').trim();
  if (!name) throw new HttpError(400, 'Borrower name is required');
  const expectedReturn = parseDate(req.body.expectedReturnDate, 'Expected return date');
  if (expectedReturn <= new Date()) throw new HttpError(400, 'Expected return date must be in the future');

  const borrowerId = String(req.body.borrowerId || slug(name) || 'unknown');
  const reservationId = UUID_RE.test(req.body.reservationId || '') ? req.body.reservationId : null;

  const { trx, asset } = await sequelize.transaction(async (t) => {
    const target = await findAsset(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!target) throw new HttpError(404, 'Asset not found');
    if (!['Available', 'Reserved'].includes(target.status)) {
      throw new HttpError(409, `Asset is currently ${target.status} and cannot be checked out`);
    }

    const condition = String(req.body.conditionAtRelease || '').trim() || target.condition;
    const created = await Transaction.create({
      borrowerId,
      borrowerName: name,
      assetId: target.id,
      assetName: target.name,
      reservationId,
      releasedBy: req.body.releasedBy || null,
      releasedByName: req.body.releasedByName || null,
      releaseDate: new Date(),
      expectedReturnDate: expectedReturn,
      conditionAtRelease: condition,
      status: 'Released',
      notes: String(req.body.notes || '').trim() || null
    }, { transaction: t });

    await created.update({
      acknowledgementRef: receiptRef(created),
      digitalSignature: signHandoff(created)
    }, { transaction: t });

    await target.update({
      status: 'Borrowed',
      condition,
      currentHolderId: borrowerId,
      currentHolderName: name
    }, { transaction: t });

    if (reservationId) {
      const reservation = await Reservation.findByPk(reservationId, { transaction: t });
      if (reservation && reservation.assetId === target.id && reservation.status === 'Approved') {
        await reservation.update({ status: 'Completed' }, { transaction: t });
      }
    }
    return { trx: created, asset: target };
  });

  await notify({
    recipientId: borrowerId,
    title: 'Asset released to you',
    message: `${asset.name} (${asset.assetTag}) is due back ${expectedReturn.toLocaleString('en-GB', { timeZone: 'UTC' })} UTC.`,
    level: 'info',
    event: 'Asset Released'
  });

  res.status(201).json(trx);
}));

router.post('/assets/:id/return', asyncRoute(async (req, res) => {
  const result = await sequelize.transaction(async (t) => {
    const asset = await findAsset(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!asset) throw new HttpError(404, 'Asset not found');

    const trx = await Transaction.findOne({
      where: { assetId: asset.id, status: OPEN_LOAN_STATUSES },
      order: [['releaseDate', 'DESC']],
      transaction: t
    });
    if (!trx) throw new HttpError(409, 'This asset is not currently on loan');

    await closeTransaction(trx, req.body, t);
    return trx;
  });

  await notify({
    recipientId: ROLES.OFFICER,
    title: 'Asset returned',
    message: `${result.assetName} was returned by ${result.borrowerName || result.borrowerId}.`,
    level: 'success',
    event: 'Asset Returned'
  });
  res.json(result);
}));

// ---------------------------------------------------------------------------
// Transactions (digital logbook)
// ---------------------------------------------------------------------------

router.get('/transactions', asyncRoute(async (req, res) => {
  await refreshOverdue();

  const where = {};
  if (UUID_RE.test(req.query.assetId || '')) where.assetId = req.query.assetId;
  if (req.query.open === 'true') where.status = OPEN_LOAN_STATUSES;

  res.json(await Transaction.findAll({
    where,
    include: [{ model: Asset, as: 'asset', attributes: ASSET_ATTRS }],
    order: [['releaseDate', 'DESC']],
    limit: 1000
  }));
}));

router.post('/transactions/:id/return', asyncRoute(async (req, res) => {
  if (!UUID_RE.test(req.params.id)) throw new HttpError(404, 'Transaction not found');

  const trx = await sequelize.transaction(async (t) => {
    const found = await Transaction.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!found) throw new HttpError(404, 'Transaction not found');
    await closeTransaction(found, req.body, t);
    return found;
  });

  await notify({
    recipientId: ROLES.OFFICER,
    title: 'Asset returned',
    message: `${trx.assetName} was returned by ${trx.borrowerName || trx.borrowerId}.`,
    level: 'success',
    event: 'Asset Returned'
  });
  res.json(trx);
}));

// ---------------------------------------------------------------------------
// Reservations
// ---------------------------------------------------------------------------

router.get('/reservations', asyncRoute(async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;
  res.json(await Reservation.findAll({
    where,
    include: [{ model: Asset, as: 'asset', attributes: ASSET_ATTRS }],
    order: [['createdAt', 'DESC']],
    limit: 1000
  }));
}));

router.post('/reservations', asyncRoute(async (req, res) => {
  const userId = String(req.body.userId || '').trim();
  if (!userId) throw new HttpError(400, 'userId is required');
  if (!req.body.assetId) throw new HttpError(400, 'Please choose an asset');

  const start = parseDate(req.body.startDate, 'Start date');
  const end = parseDate(req.body.endDate, 'End date');
  if (end <= start) throw new HttpError(400, 'End date must be after the start date');
  if (end <= new Date()) throw new HttpError(400, 'The reservation window must end in the future');

  const asset = await findAsset(String(req.body.assetId));
  if (!asset) throw new HttpError(404, 'Asset not found');
  if (UNBOOKABLE_STATUSES.includes(asset.status)) {
    throw new HttpError(409, `${asset.name} is ${asset.status} and cannot be reserved right now`);
  }

  const clash = await Reservation.findOne({
    where: { assetId: asset.id, status: 'Approved', startDate: { [Op.lt]: end }, endDate: { [Op.gt]: start } }
  });
  if (clash) throw new HttpError(409, `${asset.name} is already reserved for part of that period`);

  const reservation = await Reservation.create({
    userId,
    userName: String(req.body.userName || '').trim() || null,
    assetId: asset.id,
    assetName: asset.name,
    startDate: start,
    endDate: end,
    purpose: String(req.body.purpose || '').trim() || null,
    status: 'Pending'
  });

  await notify({
    recipientId: ROLES.APPROVER,
    title: 'New reservation awaiting approval',
    message: `${reservation.userName || userId} requested ${asset.name}.`,
    level: 'info',
    event: 'Request Approval'
  });

  res.status(201).json(reservation);
}));

const RESERVATION_TRANSITIONS = {
  Pending: ['Approved', 'Rejected', 'Cancelled'],
  Approved: ['Cancelled', 'Completed']
};

router.patch('/reservations/:id/status', asyncRoute(async (req, res) => {
  if (!UUID_RE.test(req.params.id)) throw new HttpError(404, 'Reservation not found');
  const nextStatus = req.body.status;

  const reservation = await sequelize.transaction(async (t) => {
    const found = await Reservation.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!found) throw new HttpError(404, 'Reservation not found');

    const allowed = RESERVATION_TRANSITIONS[found.status] || [];
    if (!allowed.includes(nextStatus)) {
      throw new HttpError(409, `A ${found.status.toLowerCase()} reservation cannot be changed to ${nextStatus}`);
    }

    if (nextStatus === 'Approved') {
      const clash = await Reservation.findOne({
        where: {
          assetId: found.assetId,
          status: 'Approved',
          id: { [Op.ne]: found.id },
          startDate: { [Op.lt]: found.endDate },
          endDate: { [Op.gt]: found.startDate }
        },
        transaction: t
      });
      if (clash) throw new HttpError(409, 'Another approved reservation already covers part of this period');
    }

    const changes = { status: nextStatus };
    if (req.body.approverId) changes.approverId = String(req.body.approverId);
    if (nextStatus === 'Rejected' && req.body.rejectionReason) {
      changes.rejectionReason = String(req.body.rejectionReason).trim();
    }
    await found.update(changes, { transaction: t });

    if (nextStatus === 'Approved') {
      const asset = await Asset.findByPk(found.assetId, { transaction: t });
      if (asset && asset.status === 'Available') await asset.update({ status: 'Reserved' }, { transaction: t });
    } else {
      await releaseReservedAsset(found.assetId, t);
    }
    return found;
  });

  await notify({
    recipientId: reservation.userId,
    title: `Reservation ${nextStatus.toLowerCase()}`,
    message: nextStatus === 'Rejected' && reservation.rejectionReason
      ? `Your request for ${reservation.assetName} was rejected: ${reservation.rejectionReason}`
      : `Your request for ${reservation.assetName} is now ${nextStatus.toLowerCase()}.`,
    level: nextStatus === 'Approved' ? 'success' : 'warning',
    event: `Reservation ${nextStatus}`
  });

  res.json(reservation);
}));

module.exports = router;

