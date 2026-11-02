const express = require('express');
const { Vehicle } = require('../vehicle-service/models');
const { UUID_RE, HttpError, asyncRoute, pickFields } = require('../lib/http');

const router = express.Router();

const VEHICLE_FIELDS = [
  'plateNumber', 'model', 'capacity', 'fleetStatus', 'assignedDriverId',
  'lastServiceDate', 'nextMaintenanceDate', 'mileage', 'notes'
];

function vehiclePayload(body) {
  const data = pickFields(body, VEHICLE_FIELDS);
  for (const field of ['capacity', 'mileage']) {
    if (data[field] === undefined) continue;
    if (data[field] === null) {
      if (field === 'mileage') data[field] = 0;
      continue;
    }
    const parsed = Number(data[field]);
    if (!Number.isInteger(parsed) || parsed < 0) {
      throw new HttpError(400, `${field} must be a whole number of 0 or more`);
    }
    data[field] = parsed;
  }
  if ('fleetStatus' in data && !data.fleetStatus) delete data.fleetStatus;
  return data;
}

async function findVehicle(id) {
  const vehicle = UUID_RE.test(id) ? await Vehicle.findByPk(id) : null;
  if (!vehicle) throw new HttpError(404, 'Vehicle not found');
  return vehicle;
}

router.get('/vehicles', asyncRoute(async (req, res) => {
  res.json(await Vehicle.findAll({ order: [['plateNumber', 'ASC']] }));
}));

router.post('/vehicles', asyncRoute(async (req, res) => {
  const data = vehiclePayload(req.body);
  if (!data.plateNumber) throw new HttpError(400, 'Plate number is required');
  if (!data.model) throw new HttpError(400, 'Model is required');
  res.status(201).json(await Vehicle.create(data));
}));

router.put('/vehicles/:id', asyncRoute(async (req, res) => {
  const vehicle = await findVehicle(req.params.id);
  const data = vehiclePayload(req.body);
  for (const field of ['plateNumber', 'model']) {
    if (field in data && !data[field]) throw new HttpError(400, `${field} cannot be empty`);
  }
  res.json(await vehicle.update(data));
}));

router.delete('/vehicles/:id', asyncRoute(async (req, res) => {
  const vehicle = await findVehicle(req.params.id);
  await vehicle.destroy();
  res.status(204).end();
}));

module.exports = router;

