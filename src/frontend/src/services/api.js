// SmartLogix Backend API Service Client

const BACKEND_SERVICES = {
  AUTH: 'http://localhost:5001/api/auth',
  INVENTORY: 'http://localhost:5002/api/inventory',
  VEHICLE: 'http://localhost:5003/api/vehicles',
  NOTIFICATION: 'http://localhost:5004/api/notifications'
};

// Fallback Mock Data for UI Demonstration
export const MOCK_ASSETS = [
  {
    id: 'ast-101',
    assetTag: 'AST-PROJ-01',
    name: 'Epson High-Lumen Projector',
    category: 'AV Equipment',
    description: '4K Ultra HD Portable Projector with HDMI & Wireless Display',
    location: 'Lab 304 - AV Room',
    currentHolderId: 'usr-borrower-01',
    status: 'Borrowed',
    condition: 'Excellent',
    qrCodeRef: 'QR-AST-101-EPSON',
    acquisitionDate: '2025-02-15'
  },
  {
    id: 'ast-102',
    assetTag: 'AST-LAP-05',
    name: 'Dell XPS 15 Workstation',
    category: 'Computers',
    description: 'Intel i9, 32GB RAM, 1TB SSD for Graphics & AI Workloads',
    location: 'Property Office Safe A2',
    currentHolderId: null,
    status: 'Available',
    condition: 'Good',
    qrCodeRef: 'QR-AST-102-DELL',
    acquisitionDate: '2024-11-20'
  },
  {
    id: 'ast-103',
    assetTag: 'AST-CAM-02',
    name: 'Sony Alpha A7 IV Camera Kit',
    category: 'Photography',
    description: 'Full-frame Mirrorless Camera with 24-70mm GM Lens',
    location: 'Media Dept Vault',
    currentHolderId: 'usr-borrower-02',
    status: 'Reserved',
    condition: 'Good',
    qrCodeRef: 'QR-AST-103-SONY',
    acquisitionDate: '2025-01-10'
  },
  {
    id: 'ast-104',
    assetTag: 'AST-AUD-08',
    name: 'Shure Wireless Mic System',
    category: 'Audio',
    description: 'Dual-Channel Digital Wireless Microphone Set',
    location: 'Auditorium Storage B',
    currentHolderId: null,
    status: 'Maintenance',
    condition: 'Requires Repair',
    qrCodeRef: 'QR-AST-104-SHURE',
    acquisitionDate: '2023-08-05'
  },
  {
    id: 'ast-105',
    assetTag: 'AST-OSC-01',
    name: 'Rigol Digital Oscilloscope',
    category: 'Engineering Tools',
    description: '100MHz 4-Channel Benchtop Oscilloscope',
    location: 'ECE Testing Bench 4',
    currentHolderId: 'usr-borrower-01',
    status: 'Borrowed',
    condition: 'Fair',
    qrCodeRef: 'QR-AST-105-RIGOL',
    acquisitionDate: '2024-05-12'
  }
];

export const MOCK_RESERVATIONS = [
  {
    id: 'res-301',
    assetId: 'ast-103',
    assetName: 'Sony Alpha A7 IV Camera Kit',
    userId: 'usr-borrower-01',
    userName: 'Pelumi Oloyede',
    startDate: '2026-09-22T09:00',
    endDate: '2026-09-24T17:00',
    purpose: 'Documenting Department Research Symposium',
    status: 'Pending',
    approverId: 'usr-approver-01'
  },
  {
    id: 'res-302',
    assetId: 'ast-102',
    assetName: 'Dell XPS 15 Workstation',
    userId: 'usr-borrower-02',
    userName: 'Sarah Jenkins',
    startDate: '2026-09-25T10:00',
    endDate: '2026-09-28T18:00',
    purpose: 'Senior Capstone AI Model Training',
    status: 'Approved',
    approverId: 'usr-approver-01'
  }
];

export const MOCK_TRANSACTIONS = [
  {
    id: 'trx-901',
    borrowerId: 'usr-borrower-01',
    borrowerName: 'Pelumi Oloyede',
    assetId: 'ast-101',
    assetName: 'Epson High-Lumen Projector',
    releasedBy: 'usr-officer-01',
    releaseDate: '2026-09-18T08:30:00Z',
    expectedReturnDate: '2026-09-20T17:00:00Z',
    actualReturnDate: null,
    conditionAtRelease: 'Excellent',
    conditionAtReturn: null,
    status: 'Overdue',
    digitalSignature: 'SIG-HASH-901-XYZ-VERIFIED',
    acknowledgementRef: 'REC-901-2026'
  },
  {
    id: 'trx-902',
    borrowerId: 'usr-borrower-01',
    borrowerName: 'Pelumi Oloyede',
    assetId: 'ast-105',
    assetName: 'Rigol Digital Oscilloscope',
    releasedBy: 'usr-officer-01',
    releaseDate: '2026-09-19T14:00:00Z',
    expectedReturnDate: '2026-09-22T17:00:00Z',
    actualReturnDate: null,
    conditionAtRelease: 'Fair',
    conditionAtReturn: null,
    status: 'Released',
    digitalSignature: 'SIG-HASH-902-ABC-VERIFIED',
    acknowledgementRef: 'REC-902-2026'
  }
];

export const MOCK_VEHICLES = [
  {
    id: 'vh-01',
    plateNumber: 'NXB-8821',
    model: 'Toyota HiAce Logistics Van',
    capacity: 1200,
    fleetStatus: 'Available',
    assignedDriverId: 'usr-driver-01',
    lastServiceDate: '2026-08-10',
    nextMaintenanceDate: '2026-11-10',
    mileage: 24500
  },
  {
    id: 'vh-02',
    plateNumber: 'WQC-4109',
    model: 'Isuzu Elf Heavy Utility Truck',
    capacity: 3500,
    fleetStatus: 'In Transit',
    assignedDriverId: 'usr-driver-02',
    lastServiceDate: '2026-07-22',
    nextMaintenanceDate: '2026-10-22',
    mileage: 68200
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Asset Return Overdue',
    message: 'Epson Projector (AST-PROJ-01) return deadline has passed.',
    time: '10 mins ago',
    type: 'warning',
    unread: true
  },
  {
    id: 'notif-2',
    title: 'New Reservation Pending Approval',
    message: 'Pelumi Oloyede requested Sony Camera Kit for Sept 22.',
    time: '1 hour ago',
    type: 'info',
    unread: true
  },
  {
    id: 'notif-3',
    title: 'Vehicle Maintenance Scheduled',
    message: 'Isuzu Truck (WQC-4109) routine service due next week.',
    time: '3 hours ago',
    type: 'success',
    unread: false
  }
];

// Helper wrapper for async API calls with fallback
async function fetchWithFallback(url, options = {}, fallbackData = null) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`[SmartLogix API Service] Backend connection fallback for ${url}:`, err.message);
    return fallbackData;
  }
}

export const apiService = {
  // Inventory Service APIs
  getAssets: () => fetchWithFallback(`${BACKEND_SERVICES.INVENTORY}/assets`, {}, MOCK_ASSETS),
  getAssetById: (id) => fetchWithFallback(`${BACKEND_SERVICES.INVENTORY}/assets/${id}`, {}, MOCK_ASSETS.find(a => a.id === id || a.qrCodeRef === id)),
  getReservations: () => fetchWithFallback(`${BACKEND_SERVICES.INVENTORY}/reservations`, {}, MOCK_RESERVATIONS),
  getTransactions: () => fetchWithFallback(`${BACKEND_SERVICES.INVENTORY}/transactions`, {}, MOCK_TRANSACTIONS),
  
  createReservation: (reservationData) => {
    console.log('[API] Submitting New Reservation Request:', reservationData);
    const newReservation = {
      id: `res-${Date.now()}`,
      ...reservationData,
      status: 'Pending'
    };
    MOCK_RESERVATIONS.unshift(newReservation);
    return Promise.resolve(newReservation);
  },

  updateReservationStatus: (id, status, reason = '') => {
    console.log(`[API] Updating Reservation ${id} status to ${status}`);
    const res = MOCK_RESERVATIONS.find(r => r.id === id);
    if (res) {
      res.status = status;
      if (reason) res.rejectionReason = reason;
    }
    return Promise.resolve(res);
  },

  // Vehicle Service APIs
  getVehicles: () => fetchWithFallback(`${BACKEND_SERVICES.VEHICLE}/vehicles`, {}, MOCK_VEHICLES),

  // Notification Service APIs
  getNotifications: () => fetchWithFallback(`${BACKEND_SERVICES.NOTIFICATION}/logs`, {}, MOCK_NOTIFICATIONS)
};
