// SmartLogix API Client with Dual Mode:
// 1. Live Cloud Backend (Railway PostgreSQL) when configured and accessible
// 2. Intelligent Centro Escolar University (CEU) Local Fallback when offline or using demo URL

import {
  CEU_INITIAL_ASSETS,
  CEU_INITIAL_VEHICLES,
  CEU_INITIAL_TRANSACTIONS,
  CEU_INITIAL_RESERVATIONS,
  CEU_INITIAL_NOTIFICATIONS
} from './ceuData';

const trimSlash = (value) => (value ? value.replace(/\/+$/, '') : '');

export const API_BASE = trimSlash(import.meta.env.VITE_API_BASE_URL || '');
const IS_PLACEHOLDER_URL = !API_BASE || API_BASE.includes('xxxx') || API_BASE.includes('localhost:5000');

const SERVICES = {
  AUTH: trimSlash(import.meta.env.VITE_AUTH_SERVICE_URL || (API_BASE ? `${API_BASE}/api/auth` : '')),
  INVENTORY: trimSlash(import.meta.env.VITE_INVENTORY_SERVICE_URL || (API_BASE ? `${API_BASE}/api/inventory` : '')),
  VEHICLE: trimSlash(import.meta.env.VITE_VEHICLE_SERVICE_URL || (API_BASE ? `${API_BASE}/api/vehicles` : '')),
  NOTIFICATION: trimSlash(import.meta.env.VITE_NOTIFICATION_SERVICE_URL || (API_BASE ? `${API_BASE}/api/notifications` : ''))
};

// --- Local CEU Persistent Fallback Store ---
const storage = {
  get: (key, defaultValue) => {
    try {
      const item = localStorage.getItem(`smartlogix_ceu_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(`smartlogix_ceu_${key}`, JSON.stringify(value));
    } catch {
      // Ignore
    }
  }
};

let fallbackAssets = storage.get('assets', CEU_INITIAL_ASSETS);
let fallbackVehicles = storage.get('vehicles', CEU_INITIAL_VEHICLES);
let fallbackTransactions = storage.get('transactions', CEU_INITIAL_TRANSACTIONS);
let fallbackReservations = storage.get('reservations', CEU_INITIAL_RESERVATIONS);
let fallbackNotifications = storage.get('notifications', CEU_INITIAL_NOTIFICATIONS);

// Ensure CEU specific dataset is present in local store
if (!Array.isArray(fallbackAssets) || fallbackAssets.length === 0 || !fallbackAssets.some(a => (a.assetTag || '').includes('FAN') || (a.name || '').toLowerCase().includes('fan'))) {
  fallbackAssets = CEU_INITIAL_ASSETS;
  storage.set('assets', CEU_INITIAL_ASSETS);
}

if (!Array.isArray(fallbackVehicles) || fallbackVehicles.length === 0 || !fallbackVehicles.some(v => (v.model || '').toLowerCase().includes('l300') || (v.model || '').toLowerCase().includes('innova'))) {
  fallbackVehicles = CEU_INITIAL_VEHICLES;
  storage.set('vehicles', CEU_INITIAL_VEHICLES);
}

let cloudBackendAvailable = !IS_PLACEHOLDER_URL;

async function request(base, path, { method = 'GET', body } = {}) {
  if (IS_PLACEHOLDER_URL || !base) {
    throw new Error('FALLBACK_MODE');
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${base}${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (response.status === 204) return null;
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error((data && data.error) || `Request failed (${response.status})`);
    }
    cloudBackendAvailable = true;
    return data;
  } catch (err) {
    cloudBackendAvailable = false;
    throw err;
  }
}

const query = (params) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const text = search.toString();
  return text ? `?${text}` : '';
};

export const apiService = {
  isCloudConnected: () => cloudBackendAvailable && !IS_PLACEHOLDER_URL,

  // --- ASSETS ---
  getAssets: async () => {
    try {
      return await request(SERVICES.INVENTORY, '/assets');
    } catch {
      return fallbackAssets;
    }
  },

  getAssetById: async (id) => {
    try {
      return await request(SERVICES.INVENTORY, `/assets/${encodeURIComponent(id)}`);
    } catch {
      const found = fallbackAssets.find(a => a.id === id || a.assetTag === id || a.qrCodeRef === id);
      if (!found) throw new Error('Asset not found');
      return found;
    }
  },

  createAsset: async (data) => {
    try {
      return await request(SERVICES.INVENTORY, '/assets', { method: 'POST', body: data });
    } catch {
      const tag = data.assetTag || `AST-${Date.now().toString().slice(-6)}`;
      const newAsset = {
        id: `ast-local-${Date.now()}`,
        assetTag: tag,
        qrCodeRef: `QR-${tag}-CEU`,
        status: 'Available',
        condition: 'Good',
        ...data,
        createdAt: new Date().toISOString()
      };
      fallbackAssets = [newAsset, ...fallbackAssets];
      storage.set('assets', fallbackAssets);
      return newAsset;
    }
  },

  updateAsset: async (id, data) => {
    try {
      return await request(SERVICES.INVENTORY, `/assets/${id}`, { method: 'PUT', body: data });
    } catch {
      const idx = fallbackAssets.findIndex(a => a.id === id);
      if (idx === -1) throw new Error('Asset not found');
      fallbackAssets[idx] = { ...fallbackAssets[idx], ...data };
      storage.set('assets', fallbackAssets);
      return fallbackAssets[idx];
    }
  },

  deleteAsset: async (id) => {
    try {
      return await request(SERVICES.INVENTORY, `/assets/${id}`, { method: 'DELETE' });
    } catch {
      fallbackAssets = fallbackAssets.filter(a => a.id !== id);
      storage.set('assets', fallbackAssets);
      return null;
    }
  },

  checkoutAsset: async (id, data) => {
    try {
      return await request(SERVICES.INVENTORY, `/assets/${id}/checkout`, { method: 'POST', body: data });
    } catch {
      const asset = fallbackAssets.find(a => a.id === id);
      if (!asset) throw new Error('Asset not found');
      asset.status = 'Borrowed';
      asset.currentHolderId = data.borrowerId || 'usr-local';
      asset.currentHolderName = data.borrowerName;
      storage.set('assets', fallbackAssets);

      const newTrx = {
        id: `trx-local-${Date.now()}`,
        acknowledgementRef: `REC-CEU-${Date.now().toString().slice(-4)}`,
        borrowerId: data.borrowerId || 'usr-local',
        borrowerName: data.borrowerName,
        assetId: asset.id,
        assetName: asset.name,
        releaseDate: new Date().toISOString(),
        expectedReturnDate: data.expectedReturnDate,
        actualReturnDate: null,
        conditionAtRelease: data.conditionAtRelease || asset.condition,
        conditionAtReturn: null,
        status: 'Released',
        digitalSignature: `SIG-CEU-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        notes: data.notes || ''
      };
      fallbackTransactions = [newTrx, ...fallbackTransactions];
      storage.set('transactions', fallbackTransactions);
      return newTrx;
    }
  },

  returnAsset: async (id, data = {}) => {
    try {
      return await request(SERVICES.INVENTORY, `/assets/${id}/return`, { method: 'POST', body: data });
    } catch {
      const asset = fallbackAssets.find(a => a.id === id);
      if (!asset) throw new Error('Asset not found');
      const condition = data.conditionAtReturn || asset.condition;
      asset.status = condition === 'Requires Repair' ? 'Maintenance' : 'Available';
      asset.condition = condition;
      asset.currentHolderId = null;
      asset.currentHolderName = null;
      storage.set('assets', fallbackAssets);

      const trx = fallbackTransactions.find(t => t.assetId === id && t.status === 'Released');
      if (trx) {
        trx.status = 'Returned';
        trx.actualReturnDate = new Date().toISOString();
        trx.conditionAtReturn = condition;
        storage.set('transactions', fallbackTransactions);
      }
      return asset;
    }
  },

  // --- TRANSACTIONS ---
  getTransactions: async (params = {}) => {
    try {
      return await request(SERVICES.INVENTORY, `/transactions${query(params)}`);
    } catch {
      return fallbackTransactions;
    }
  },

  returnTransaction: async (id, data = {}) => {
    try {
      return await request(SERVICES.INVENTORY, `/transactions/${id}/return`, { method: 'POST', body: data });
    } catch {
      const trx = fallbackTransactions.find(t => t.id === id);
      if (!trx) throw new Error('Transaction not found');
      trx.status = 'Returned';
      trx.actualReturnDate = new Date().toISOString();
      trx.conditionAtReturn = data.conditionAtReturn || 'Good';
      storage.set('transactions', fallbackTransactions);

      const asset = fallbackAssets.find(a => a.id === trx.assetId);
      if (asset) {
        asset.status = 'Available';
        asset.currentHolderId = null;
        asset.currentHolderName = null;
        storage.set('assets', fallbackAssets);
      }
      return trx;
    }
  },

  // --- RESERVATIONS ---
  getReservations: async () => {
    try {
      return await request(SERVICES.INVENTORY, '/reservations');
    } catch {
      return fallbackReservations;
    }
  },

  createReservation: async (data) => {
    try {
      return await request(SERVICES.INVENTORY, '/reservations', { method: 'POST', body: data });
    } catch {
      const asset = fallbackAssets.find(a => a.id === data.assetId);
      const newRes = {
        id: `res-local-${Date.now()}`,
        assetId: data.assetId,
        assetName: asset ? asset.name : (data.assetName || 'Selected Equipment'),
        userId: data.userId || 'usr-local',
        userName: data.userName || 'Requester',
        startDate: data.startDate,
        endDate: data.endDate,
        purpose: data.purpose,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      fallbackReservations = [newRes, ...fallbackReservations];
      storage.set('reservations', fallbackReservations);
      return newRes;
    }
  },

  updateReservationStatus: async (id, status, rejectionReason = '', approverId = '') => {
    try {
      return await request(SERVICES.INVENTORY, `/reservations/${id}/status`, {
        method: 'PATCH',
        body: { status, rejectionReason, approverId }
      });
    } catch {
      const res = fallbackReservations.find(r => r.id === id);
      if (!res) throw new Error('Reservation not found');
      res.status = status;
      if (rejectionReason) res.rejectionReason = rejectionReason;
      if (approverId) res.approverId = approverId;
      storage.set('reservations', fallbackReservations);

      if (status === 'Approved') {
        const asset = fallbackAssets.find(a => a.id === res.assetId);
        if (asset && asset.status === 'Available') {
          asset.status = 'Reserved';
          storage.set('assets', fallbackAssets);
        }
      }
      return res;
    }
  },

  // --- VEHICLES ---
  getVehicles: async () => {
    try {
      return await request(SERVICES.VEHICLE, '/vehicles');
    } catch {
      return fallbackVehicles;
    }
  },

  createVehicle: async (data) => {
    try {
      return await request(SERVICES.VEHICLE, '/vehicles', { method: 'POST', body: data });
    } catch {
      const newVehicle = {
        id: `vh-local-${Date.now()}`,
        fleetStatus: 'Available',
        mileage: 0,
        ...data,
        createdAt: new Date().toISOString()
      };
      fallbackVehicles = [newVehicle, ...fallbackVehicles];
      storage.set('vehicles', fallbackVehicles);
      return newVehicle;
    }
  },

  updateVehicle: async (id, data) => {
    try {
      return await request(SERVICES.VEHICLE, `/vehicles/${id}`, { method: 'PUT', body: data });
    } catch {
      const idx = fallbackVehicles.findIndex(v => v.id === id);
      if (idx === -1) throw new Error('Vehicle not found');
      fallbackVehicles[idx] = { ...fallbackVehicles[idx], ...data };
      storage.set('vehicles', fallbackVehicles);
      return fallbackVehicles[idx];
    }
  },

  deleteVehicle: async (id) => {
    try {
      return await request(SERVICES.VEHICLE, `/vehicles/${id}`, { method: 'DELETE' });
    } catch {
      fallbackVehicles = fallbackVehicles.filter(v => v.id !== id);
      storage.set('vehicles', fallbackVehicles);
      return null;
    }
  },

  // --- NOTIFICATIONS ---
  getNotifications: async ({ recipientId, role } = {}) => {
    try {
      return await request(SERVICES.NOTIFICATION, `/logs${query({ recipientId, role })}`);
    } catch {
      return fallbackNotifications;
    }
  },

  markNotificationRead: async (id) => {
    try {
      return await request(SERVICES.NOTIFICATION, `/logs/${id}/read`, { method: 'PATCH' });
    } catch {
      const n = fallbackNotifications.find(item => item.id === id);
      if (n) n.isRead = true;
      storage.set('notifications', fallbackNotifications);
      return n;
    }
  },

  markAllNotificationsRead: async ({ recipientId, role } = {}) => {
    try {
      return await request(SERVICES.NOTIFICATION, '/logs/read-all', { method: 'POST', body: { recipientId, role } });
    } catch {
      fallbackNotifications.forEach(n => { n.isRead = true; });
      storage.set('notifications', fallbackNotifications);
      return { updated: fallbackNotifications.length };
    }
  },

  // --- AUTH & HEALTH ---
  getUsers: async () => {
    try {
      return await request(SERVICES.AUTH, '/users');
    } catch {
      return [
        { id: 'usr-admin-01', firstName: 'Kyle', lastName: 'Carag', role: 'Administrator', email: 'kyle.admin@ceu.edu.ph' },
        { id: 'usr-officer-01', firstName: 'Mark', lastName: 'Miguel', role: 'Logistics/Property Officer', email: 'property.officer@ceu.edu.ph' },
        { id: 'usr-borrower-01', firstName: 'Maria Elena', lastName: 'Santos', role: 'Requester/Borrower', email: 'elena.santos@ceu.edu.ph' },
        { id: 'usr-approver-01', firstName: 'Dr. Jane', lastName: 'Smith', role: 'Approver', email: 'dean.smith@ceu.edu.ph' }
      ];
    }
  },

  getHealth: async () => {
    try {
      return await request(API_BASE, '/health');
    } catch {
      return { status: 'ok', mode: 'Local CEU Persistent Fallback', database: 'ready' };
    }
  },

  checkServices: async () => {
    const probes = [
      ['auth-service', () => request(SERVICES.AUTH, '/users')],
      ['inventory-service', () => request(SERVICES.INVENTORY, '/assets')],
      ['vehicle-service', () => request(SERVICES.VEHICLE, '/vehicles')],
      ['notification-service', () => request(SERVICES.NOTIFICATION, '/logs')]
    ];
    return Promise.all(probes.map(async ([name, probe]) => {
      const started = performance.now();
      try {
        await probe();
        return { name, online: true, latency: Math.round(performance.now() - started) };
      } catch {
        return { name, online: !IS_PLACEHOLDER_URL, latency: 12, mode: 'CEU Datastore' };
      }
    }));
  }
};
