// SmartLogix API client. Every call talks to the real backend; there is no bundled sample data.

const trimSlash = (value) => value.replace(/\/+$/, '');

export const API_BASE = trimSlash(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');

const SERVICES = {
  AUTH: trimSlash(import.meta.env.VITE_AUTH_SERVICE_URL || `${API_BASE}/api/auth`),
  INVENTORY: trimSlash(import.meta.env.VITE_INVENTORY_SERVICE_URL || `${API_BASE}/api/inventory`),
  VEHICLE: trimSlash(import.meta.env.VITE_VEHICLE_SERVICE_URL || `${API_BASE}/api/vehicles`),
  NOTIFICATION: trimSlash(import.meta.env.VITE_NOTIFICATION_SERVICE_URL || `${API_BASE}/api/notifications`)
};

async function request(base, path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw new Error(`Cannot reach the SmartLogix API at ${base}. Check that the backend is running and VITE_API_BASE_URL is correct.`);
  }

  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error((data && data.error) || `Request failed (${response.status})`);
  }
  return data;
}

const inventory = (path, options) => request(SERVICES.INVENTORY, path, options);
const vehicle = (path, options) => request(SERVICES.VEHICLE, path, options);
const notification = (path, options) => request(SERVICES.NOTIFICATION, path, options);

const query = (params) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const text = search.toString();
  return text ? `?${text}` : '';
};

export const apiService = {
  // Inventory service: assets
  getAssets: () => inventory('/assets'),
  getAssetById: (id) => inventory(`/assets/${encodeURIComponent(id)}`),
  createAsset: (data) => inventory('/assets', { method: 'POST', body: data }),
  updateAsset: (id, data) => inventory(`/assets/${id}`, { method: 'PUT', body: data }),
  deleteAsset: (id) => inventory(`/assets/${id}`, { method: 'DELETE' }),
  checkoutAsset: (id, data) => inventory(`/assets/${id}/checkout`, { method: 'POST', body: data }),
  returnAsset: (id, data = {}) => inventory(`/assets/${id}/return`, { method: 'POST', body: data }),

  // Inventory service: digital logbook
  getTransactions: (params = {}) => inventory(`/transactions${query(params)}`),
  returnTransaction: (id, data = {}) => inventory(`/transactions/${id}/return`, { method: 'POST', body: data }),

  // Inventory service: reservations
  getReservations: () => inventory('/reservations'),
  createReservation: (data) => inventory('/reservations', { method: 'POST', body: data }),
  updateReservationStatus: (id, status, rejectionReason = '', approverId = '') =>
    inventory(`/reservations/${id}/status`, { method: 'PATCH', body: { status, rejectionReason, approverId } }),

  // Vehicle service
  getVehicles: () => vehicle('/vehicles'),
  createVehicle: (data) => vehicle('/vehicles', { method: 'POST', body: data }),
  updateVehicle: (id, data) => vehicle(`/vehicles/${id}`, { method: 'PUT', body: data }),
  deleteVehicle: (id) => vehicle(`/vehicles/${id}`, { method: 'DELETE' }),

  // Notification service
  getNotifications: ({ recipientId, role } = {}) => notification(`/logs${query({ recipientId, role })}`),
  markNotificationRead: (id) => notification(`/logs/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: ({ recipientId, role }) =>
    notification('/logs/read-all', { method: 'POST', body: { recipientId, role } }),

  // Auth service
  getUsers: () => request(SERVICES.AUTH, '/users'),

  // Gateway health
  getHealth: () => request(API_BASE, '/health'),

  /** Probes each microservice endpoint and reports whether it answered, and how fast. */
  async checkServices() {
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
      } catch (err) {
        return { name, online: false, error: err.message };
      }
    }));
  }
};
