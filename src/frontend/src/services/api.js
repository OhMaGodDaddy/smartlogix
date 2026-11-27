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
const withProtocol = (value) => {
  const cleaned = trimSlash(value);
  if (!cleaned) return '';
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(cleaned)) return `http://${cleaned}`;
  return `https://${cleaned}`;
};
const validUrl = (value) => {
  const normalized = withProtocol(value);
  return !normalized || normalized.includes('xxxx') ? '' : normalized;
};

export const API_BASE = validUrl(import.meta.env.VITE_API_BASE_URL) || 'https://smartlogix-production-2f5d.up.railway.app';
const IS_PLACEHOLDER_URL = !API_BASE;

const SERVICES = {
  AUTH: validUrl(import.meta.env.VITE_AUTH_SERVICE_URL) || `${API_BASE}/api/auth`,
  INVENTORY: validUrl(import.meta.env.VITE_INVENTORY_SERVICE_URL) || `${API_BASE}/api/inventory`,
  VEHICLE: validUrl(import.meta.env.VITE_VEHICLE_SERVICE_URL) || `${API_BASE}/api/vehicles`,
  NOTIFICATION: validUrl(import.meta.env.VITE_NOTIFICATION_SERVICE_URL) || `${API_BASE}/api/notifications`
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

// --- Connection status (drives the offline banner) ---
let cloudBackendAvailable = !IS_PLACEHOLDER_URL;
const connectionListeners = new Set();

const setCloudAvailable = (value) => {
  if (cloudBackendAvailable === value) return;
  cloudBackendAvailable = value;
  connectionListeners.forEach((listener) => listener());
};

export const subscribeConnection = (listener) => {
  connectionListeners.add(listener);
  return () => connectionListeners.delete(listener);
};

/**
 * The local fallback is only for an unreachable backend. An error with `answered` set
 * must reach the user, because saving locally would report a failed action as done.
 */
const answeredError = (message) => Object.assign(new Error(message), { answered: true });
const rethrowIfAnswered = (err) => {
  if (err.answered) throw err;
};

// Gateway errors, including the API's own "database is not connected yet" (503).
const UNREACHABLE_STATUSES = [502, 503, 504];

async function request(base, path, { method = 'GET', body } = {}) {
  if (IS_PLACEHOLDER_URL || !base) {
    throw new Error('FALLBACK_MODE');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal
    });

    if (response.status === 204) {
      setCloudAvailable(true);
      return null;
    }
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // Only an `{ error }` body comes from our API; a hosting platform's error page does not.
      if (typeof data?.error === 'string' && !UNREACHABLE_STATUSES.includes(response.status)) {
        setCloudAvailable(true);
        throw answeredError(data.error);
      }
      throw new Error(data?.error || `Request failed (${response.status})`);
    }
    if (data === null) throw new Error('The server sent an unreadable response');

    setCloudAvailable(true);
    return data;
  } catch (err) {
    if (err.answered) throw err;
    // A write that timed out may still have reached the server, so don't redo it locally.
    if (err.name === 'AbortError' && method !== 'GET') {
      throw answeredError('The server took too long to respond. Refresh to check whether the change was saved before trying again.');
    }
    setCloudAvailable(false);
    throw err;
  } finally {
    clearTimeout(timeout);
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
    } catch (err) {
      rethrowIfAnswered(err);
      return fallbackAssets;
    }
  },

  getAssetById: async (id) => {
    try {
      return await request(SERVICES.INVENTORY, `/assets/${encodeURIComponent(id)}`);
    } catch (err) {
      rethrowIfAnswered(err);
      const found = fallbackAssets.find(a => a.id === id || a.assetTag === id || a.qrCodeRef === id);
      if (!found) throw new Error('Asset not found');
      return found;
    }
  },

  createAsset: async (data) => {
    try {
      return await request(SERVICES.INVENTORY, '/assets', { method: 'POST', body: data });
    } catch (err) {
      rethrowIfAnswered(err);
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
    } catch (err) {
      rethrowIfAnswered(err);
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
    } catch (err) {
      rethrowIfAnswered(err);
      fallbackAssets = fallbackAssets.filter(a => a.id !== id);
      storage.set('assets', fallbackAssets);
      return null;
    }
  },

  checkoutAsset: async (id, data) => {
    try {
      return await request(SERVICES.INVENTORY, `/assets/${id}/checkout`, { method: 'POST', body: data });
    } catch (err) {
      rethrowIfAnswered(err);
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
    } catch (err) {
      rethrowIfAnswered(err);
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
    } catch (err) {
      rethrowIfAnswered(err);
      return fallbackTransactions;
    }
  },

  returnTransaction: async (id, data = {}) => {
    try {
      return await request(SERVICES.INVENTORY, `/transactions/${id}/return`, { method: 'POST', body: data });
    } catch (err) {
      rethrowIfAnswered(err);
      const trx = fallbackTransactions.find(t => t.id === id);
      if (!trx) throw new Error('Transaction not found');
      trx.status = 'Returned';
      trx.actualReturnDate = new Date().toISOString();
      trx.conditionAtReturn = data.conditionAtReturn || 'Good';
      storage.set('transactions', fallbackTransactions);

      const asset = fallbackAssets.find(a => a.id === trx.assetId);
      if (asset) {
        asset.status = trx.conditionAtReturn === 'Requires Repair' ? 'Maintenance' : 'Available';
        asset.condition = trx.conditionAtReturn;
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
    } catch (err) {
      rethrowIfAnswered(err);
      return fallbackReservations;
    }
  },

  createReservation: async (data) => {
    try {
      return await request(SERVICES.INVENTORY, '/reservations', { method: 'POST', body: data });
    } catch (err) {
      rethrowIfAnswered(err);
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
    } catch (err) {
      rethrowIfAnswered(err);
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
    } catch (err) {
      rethrowIfAnswered(err);
      return fallbackVehicles;
    }
  },

  createVehicle: async (data) => {
    try {
      return await request(SERVICES.VEHICLE, '/vehicles', { method: 'POST', body: data });
    } catch (err) {
      rethrowIfAnswered(err);
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
    } catch (err) {
      rethrowIfAnswered(err);
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
    } catch (err) {
      rethrowIfAnswered(err);
      fallbackVehicles = fallbackVehicles.filter(v => v.id !== id);
      storage.set('vehicles', fallbackVehicles);
      return null;
    }
  },

  // --- NOTIFICATIONS ---
  getNotifications: async ({ recipientId, role } = {}) => {
    try {
      return await request(SERVICES.NOTIFICATION, `/logs${query({ recipientId, role })}`);
    } catch (err) {
      rethrowIfAnswered(err);
      return fallbackNotifications;
    }
  },

  markNotificationRead: async (id) => {
    try {
      return await request(SERVICES.NOTIFICATION, `/logs/${id}/read`, { method: 'PATCH' });
    } catch (err) {
      rethrowIfAnswered(err);
      const n = fallbackNotifications.find(item => item.id === id);
      if (n) n.isRead = true;
      storage.set('notifications', fallbackNotifications);
      return n;
    }
  },

  markAllNotificationsRead: async ({ recipientId, role } = {}) => {
    try {
      return await request(SERVICES.NOTIFICATION, '/logs/read-all', { method: 'POST', body: { recipientId, role } });
    } catch (err) {
      rethrowIfAnswered(err);
      fallbackNotifications.forEach(n => { n.isRead = true; });
      storage.set('notifications', fallbackNotifications);
      return { updated: fallbackNotifications.length };
    }
  },

  // --- AUTH & HEALTH ---
  getUsers: async () => {
    try {
      return await request(SERVICES.AUTH, '/users');
    } catch (err) {
      rethrowIfAnswered(err);
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
      const data = await request(API_BASE, '/health');
      return { ...data, liveGateway: true };
    } catch (err) {
      return {
        status: 'fallback',
        liveGateway: false,
        mode: 'Local CEU Persistent Fallback',
        database: 'localStorage',
        error: err.message
      };
    }
  },

  checkServices: async () => {
    const probes = [
      ['auth-service', `${SERVICES.AUTH}/users`, () => request(SERVICES.AUTH, '/users')],
      ['inventory-service', `${SERVICES.INVENTORY}/assets`, () => request(SERVICES.INVENTORY, '/assets')],
      ['vehicle-service', `${SERVICES.VEHICLE}/vehicles`, () => request(SERVICES.VEHICLE, '/vehicles')],
      ['notification-service', `${SERVICES.NOTIFICATION}/logs`, () => request(SERVICES.NOTIFICATION, '/logs')]
    ];

    let gatewayHealth = null;
    try {
      gatewayHealth = await request(API_BASE, '/health');
    } catch {
      gatewayHealth = null;
    }

    return Promise.all(probes.map(async ([name, endpoint, probe]) => {
      const started = performance.now();
      try {
        await probe();
        return {
          name,
          endpoint,
          online: true,
          liveBackend: true,
          mode: 'Live REST API + PostgreSQL',
          latency: Math.round(performance.now() - started)
        };
      } catch (err) {
        const latency = Math.round(performance.now() - started);
        if (gatewayHealth) {
          return {
            name,
            endpoint,
            online: true,
            liveBackend: false,
            gatewayReachable: true,
            mode: `API Gateway Up (DB: ${gatewayHealth.database || 'disconnected'}) → CEU Local Fallback`,
            latency,
            error: err.message
          };
        }
        return {
          name,
          endpoint,
          online: true,
          liveBackend: false,
          gatewayReachable: false,
          mode: 'Offline → CEU Local Datastore Fallback',
          latency,
          error: err.message || 'Backend unreachable'
        };
      }
    }));
  }
};
