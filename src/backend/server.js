const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

// Import Service Models
const { User } = require('./auth-service/models');
const { Asset, Reservation, Transaction } = require('./inventory-service/models');
const { Vehicle } = require('./vehicle-service/models');
const { NotificationLog } = require('./notification-service/models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health Check (Used by Railway and uptime monitors)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'SmartLogix API Gateway', uptime: process.uptime() });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'SmartLogix Unified API Gateway',
    version: '1.0.0',
    status: 'Operational',
    endpoints: [
      '/health',
      '/api/inventory/assets',
      '/api/inventory/reservations',
      '/api/inventory/transactions',
      '/api/vehicles/vehicles',
      '/api/notifications/logs',
      '/api/auth/users'
    ]
  });
});

// ==========================================
// 1. INVENTORY SERVICE ROUTES
// ==========================================
const inventoryRouter = express.Router();

// Assets
inventoryRouter.get('/assets', async (req, res) => {
  try {
    const assets = await Asset.findAll({ order: [['createdAt', 'DESC']] });
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

inventoryRouter.get('/assets/:id', async (req, res) => {
  try {
    const asset = await Asset.findOne({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { id: req.params.id },
          { qrCodeRef: req.params.id },
          { assetTag: req.params.id }
        ]
      }
    });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    res.json(asset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

inventoryRouter.post('/assets', async (req, res) => {
  try {
    const newAsset = await Asset.create(req.body);
    res.status(201).json(newAsset);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reservations
inventoryRouter.get('/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      include: [{ model: Asset, as: 'asset' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

inventoryRouter.post('/reservations', async (req, res) => {
  try {
    const reservation = await Reservation.create(req.body);
    res.status(201).json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

inventoryRouter.patch('/reservations/:id/status', async (req, res) => {
  try {
    const { status, rejectionReason, approverId } = req.body;
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

    reservation.status = status || reservation.status;
    if (rejectionReason) reservation.rejectionReason = rejectionReason;
    if (approverId) reservation.approverId = approverId;
    await reservation.save();

    res.json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Transactions
inventoryRouter.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [{ model: Asset, as: 'asset' }],
      order: [['releaseDate', 'DESC']]
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

inventoryRouter.post('/transactions', async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.use('/api/inventory', inventoryRouter);

// ==========================================
// 2. VEHICLE SERVICE ROUTES
// ==========================================
const vehicleRouter = express.Router();

vehicleRouter.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({ order: [['plateNumber', 'ASC']] });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

vehicleRouter.post('/vehicles', async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.use('/api/vehicles', vehicleRouter);

// ==========================================
// 3. NOTIFICATION SERVICE ROUTES
// ==========================================
const notificationRouter = express.Router();

notificationRouter.get('/logs', async (req, res) => {
  try {
    const logs = await NotificationLog.findAll({ order: [['createdAt', 'DESC']] });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

notificationRouter.post('/logs', async (req, res) => {
  try {
    const log = await NotificationLog.create(req.body);
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.use('/api/notifications', notificationRouter);

// ==========================================
// 4. AUTH SERVICE ROUTES
// ==========================================
const authRouter = express.Router();

authRouter.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['passwordHash'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/auth', authRouter);

// Database Seeder for Initial Run
async function seedInitialData() {
  const assetCount = await Asset.count();
  if (assetCount === 0) {
    console.log('[Seed] Populating initial demo assets...');
    await Asset.bulkCreate([
      {
        assetTag: 'AST-PROJ-01',
        name: 'Epson High-Lumen Projector',
        category: 'AV Equipment',
        description: '4K Ultra HD Portable Projector with HDMI & Wireless Display',
        location: 'Lab 304 - AV Room',
        status: 'Borrowed',
        condition: 'Excellent',
        qrCodeRef: 'QR-AST-101-EPSON',
        acquisitionDate: '2025-02-15'
      },
      {
        assetTag: 'AST-LAP-05',
        name: 'Dell XPS 15 Workstation',
        category: 'Computers',
        description: 'Intel i9, 32GB RAM, 1TB SSD for Graphics & AI Workloads',
        location: 'Property Office Safe A2',
        status: 'Available',
        condition: 'Good',
        qrCodeRef: 'QR-AST-102-DELL',
        acquisitionDate: '2024-11-20'
      },
      {
        assetTag: 'AST-CAM-02',
        name: 'Sony Alpha A7 IV Camera Kit',
        category: 'Photography',
        description: 'Full-frame Mirrorless Camera with 24-70mm GM Lens',
        location: 'Media Dept Vault',
        status: 'Reserved',
        condition: 'Good',
        qrCodeRef: 'QR-AST-103-SONY',
        acquisitionDate: '2025-01-10'
      },
      {
        assetTag: 'AST-AUD-08',
        name: 'Shure Wireless Mic System',
        category: 'Audio',
        description: 'Dual-Channel Digital Wireless Microphone Set',
        location: 'Auditorium Storage B',
        status: 'Maintenance',
        condition: 'Requires Repair',
        qrCodeRef: 'QR-AST-104-SHURE',
        acquisitionDate: '2023-08-05'
      },
      {
        assetTag: 'AST-OSC-01',
        name: 'Rigol Digital Oscilloscope',
        category: 'Engineering Tools',
        description: '100MHz 4-Channel Benchtop Oscilloscope',
        location: 'ECE Testing Bench 4',
        status: 'Borrowed',
        condition: 'Fair',
        qrCodeRef: 'QR-AST-105-RIGOL',
        acquisitionDate: '2024-05-12'
      }
    ]);
  }

  const vehicleCount = await Vehicle.count();
  if (vehicleCount === 0) {
    console.log('[Seed] Populating initial demo vehicles...');
    await Vehicle.bulkCreate([
      {
        plateNumber: 'WQC-4109',
        model: 'Isuzu D-Max Service Truck',
        capacity: 1000,
        fleetStatus: 'Available',
        lastServiceDate: '2026-08-10',
        nextMaintenanceDate: '2026-11-15',
        mileage: 34200
      },
      {
        plateNumber: 'NDX-8821',
        model: 'Toyota HiAce Commuter Van',
        capacity: 15,
        fleetStatus: 'In Transit',
        lastServiceDate: '2026-07-22',
        nextMaintenanceDate: '2026-10-30',
        mileage: 51800
      },
      {
        plateNumber: 'TGB-5510',
        model: 'Mitsubishi L300 Utility Van',
        capacity: 1200,
        fleetStatus: 'Maintenance',
        lastServiceDate: '2026-06-15',
        nextMaintenanceDate: '2026-09-18',
        mileage: 89400
      }
    ]);
  }
}

// Start Server & Sync Database
async function startServer() {
  try {
    console.log('[SmartLogix] Testing PostgreSQL connection...');
    await sequelize.authenticate();
    console.log('[SmartLogix] PostgreSQL connection established successfully.');

    // Sync database schema
    await sequelize.sync({ alter: true });
    console.log('[SmartLogix] Database schema synchronized.');

    // Seed mock data if tables are empty
    await seedInitialData();

    app.listen(PORT, () => {
      console.log(`[SmartLogix API Gateway] Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('[SmartLogix] Unable to connect to PostgreSQL database:', error.message);
    // Start HTTP server anyway so health checks and diagnostics can report status
    app.listen(PORT, () => {
      console.log(`[SmartLogix API Gateway] Server listening on port ${PORT} (Database offline: ${error.message})`);
    });
  }
}

startServer();

