/**
 * Default Centro Escolar University (CEU) Dataset
 * Centralized logistics, property inventory, and fleet management records.
 */

export const CEU_INITIAL_ASSETS = [
  {
    id: 'ast-ceu-fan-01',
    assetTag: 'AST-FAN-01',
    name: 'Standard 24" Industrial Heavy-Duty Stand Fan',
    category: 'Facility Equipment',
    description: 'High-velocity 3-speed oscillating industrial metal stand fan for university gymnasium events and student assemblies',
    location: 'CEU Manila - Student Activity Center (SAC) Gym',
    status: 'Available',
    condition: 'Good',
    currentHolderId: null,
    currentHolderName: null,
    qrCodeRef: 'QR-AST-FAN-01-CEU',
    acquisitionDate: '2025-03-10',
    acquisitionCost: 6500.00
  },
  {
    id: 'ast-ceu-fan-02',
    assetTag: 'AST-FAN-02',
    name: 'Asahi 20" Industrial Floor Blower Fan',
    category: 'Facility Equipment',
    description: 'High-velocity portable floor drum blower for auditorium stage cooling and university ceremonies',
    location: 'CEU Carmen de Luna Hall - Auditorium Stage',
    status: 'Borrowed',
    condition: 'Excellent',
    currentHolderId: 'usr-borrower-01',
    currentHolderName: 'Prof. Maria Elena Santos (CEU Choir)',
    qrCodeRef: 'QR-AST-FAN-02-CEU',
    acquisitionDate: '2025-05-18',
    acquisitionCost: 5200.00
  },
  {
    id: 'ast-ceu-fan-03',
    assetTag: 'AST-FAN-03',
    name: 'Standard 24" Industrial Stand Fan - Unit 2',
    category: 'Facility Equipment',
    description: 'Heavy-duty industrial fan assigned to the science building ground lobby (oscillation gearbox maintenance pending)',
    location: 'CEU Generosa de Leon Science Complex',
    status: 'Maintenance',
    condition: 'Requires Repair',
    currentHolderId: null,
    currentHolderName: null,
    qrCodeRef: 'QR-AST-FAN-03-CEU',
    acquisitionDate: '2024-08-22',
    acquisitionCost: 6500.00
  },
  {
    id: 'ast-ceu-proj-01',
    assetTag: 'AST-PROJ-01',
    name: 'Epson EB-2250U 5000-Lumen Full HD Projector',
    category: 'AV & Multi-Media',
    description: 'High-brightness WUXGA laser presentation projector with dual HDMI for medical symposiums and accreditation presentations',
    location: 'CEU North Building - Audio-Visual Room 3',
    status: 'Available',
    condition: 'Excellent',
    currentHolderId: null,
    currentHolderName: null,
    qrCodeRef: 'QR-AST-PROJ-01-CEU',
    acquisitionDate: '2025-01-15',
    acquisitionCost: 68000.00
  },
  {
    id: 'ast-ceu-mic-01',
    assetTag: 'AST-MIC-01',
    name: 'Olympus CX23 Binocular Compound Microscope',
    category: 'Laboratory Equipment',
    description: 'LED optical laboratory microscope for medical technology, pharmacy, and biological science practical examinations',
    location: 'College of Pharmacy - MedTech Lab 401',
    status: 'Available',
    condition: 'Good',
    currentHolderId: null,
    currentHolderName: null,
    qrCodeRef: 'QR-AST-MIC-01-CEU',
    acquisitionDate: '2024-11-20',
    acquisitionCost: 45000.00
  },
  {
    id: 'ast-ceu-dent-01',
    assetTag: 'AST-DENT-01',
    name: 'Belmont Pre-Clinical Dental Simulator Phantom Head',
    category: 'Medical & Dental',
    description: 'Anatomical patient simulator with high-speed turbine handpiece mount for clinical dentistry prosthodontics training',
    location: 'CEU College of Dentistry - Simulation Lab 2',
    status: 'Available',
    condition: 'Good',
    currentHolderId: null,
    currentHolderName: null,
    qrCodeRef: 'QR-AST-DENT-01-CEU',
    acquisitionDate: '2024-09-12',
    acquisitionCost: 110000.00
  },
  {
    id: 'ast-ceu-pa-01',
    assetTag: 'AST-PA-01',
    name: 'Yamaha StagePas 600BT Portable PA Sound System',
    category: 'AV & Multi-Media',
    description: 'Dual 340W powered mixer speakers with Shure wireless handheld microphone kit for university events',
    location: 'Mendiola Property Custodian Office',
    status: 'Reserved',
    condition: 'Good',
    currentHolderId: null,
    currentHolderName: null,
    qrCodeRef: 'QR-AST-PA-01-CEU',
    acquisitionDate: '2025-02-05',
    acquisitionCost: 58000.00
  },
  {
    id: 'ast-ceu-tab-01',
    assetTag: 'AST-TAB-01',
    name: 'Lifetime 6ft Heavy Duty Folding Seminar Tables (Set of 10)',
    category: 'Events & Staging',
    description: 'Heavy-duty blow-molded banquet tables for university career fairs, enrollment centers, and graduation registration',
    location: 'Central Property Warehouse - Bay 4',
    status: 'Available',
    condition: 'Good',
    currentHolderId: null,
    currentHolderName: null,
    qrCodeRef: 'QR-AST-TAB-01-CEU',
    acquisitionDate: '2024-06-14',
    acquisitionCost: 35000.00
  },
  {
    id: 'ast-ceu-pallet-01',
    assetTag: 'AST-PALLET-01',
    name: 'Noblelift 2.5-Ton Hydraulic Manual Pallet Jack',
    category: 'Property Logistics',
    description: 'Heavy materials handling pallet truck for bulk university delivery intake and warehouse staging',
    location: 'CEU Central Warehouse - Loading Dock',
    status: 'Available',
    condition: 'Good',
    currentHolderId: null,
    currentHolderName: null,
    qrCodeRef: 'QR-AST-PALLET-01-CEU',
    acquisitionDate: '2023-10-30',
    acquisitionCost: 24000.00
  }
];

export const CEU_INITIAL_VEHICLES = [
  {
    id: 'vh-ceu-01',
    plateNumber: 'NGB-1042',
    model: 'Mitsubishi L300 FB Exceed 2.2L Diesel',
    capacity: 15,
    fleetStatus: 'Available',
    assignedDriverId: 'Mang Ben Santos (Campus Transport)',
    mileage: 42150,
    lastServiceDate: '2026-09-15',
    nextMaintenanceDate: '2026-11-20',
    notes: 'CEU Mendiola - Makati shuttle, inter-branch document transfer, and faculty transport'
  },
  {
    id: 'vh-ceu-02',
    plateNumber: 'NDL-5821',
    model: 'Toyota Innova 2.8 E Diesel Automatic',
    capacity: 8,
    fleetStatus: 'In Transit',
    assignedDriverId: 'Kuya Rolly Mendoza',
    mileage: 28400,
    lastServiceDate: '2026-08-30',
    nextMaintenanceDate: '2026-12-05',
    notes: 'Official university administrative delegation and guest lecturer transportation'
  },
  {
    id: 'vh-ceu-03',
    plateNumber: 'WQC-7719',
    model: 'Toyota HiAce GL Grandia Commuter 3.0L',
    capacity: 14,
    fleetStatus: 'Available',
    assignedDriverId: 'Edgardo "Mang Ed" Ramos',
    mileage: 61200,
    lastServiceDate: '2026-07-10',
    nextMaintenanceDate: '2026-11-15',
    notes: 'Student council regional symposiums and athletic varsity team inter-school transport'
  },
  {
    id: 'vh-ceu-04',
    plateNumber: 'NBD-3490',
    model: 'Isuzu Traviz Heavy Dropside Utility Truck',
    capacity: 1600,
    fleetStatus: 'Maintenance',
    assignedDriverId: 'Property Logistics Pool',
    mileage: 53900,
    lastServiceDate: '2026-08-12',
    nextMaintenanceDate: '2026-11-05',
    notes: 'Campus physical plant facilities, heavy classroom furniture transfer between Manila and Malolos campuses'
  }
];

export const CEU_INITIAL_TRANSACTIONS = [
  {
    id: 'trx-ceu-01',
    acknowledgementRef: 'REC-CEU-2026-001',
    borrowerId: 'usr-borrower-01',
    borrowerName: 'Prof. Maria Elena Santos (CEU Choir)',
    assetId: 'ast-ceu-fan-02',
    assetName: 'Asahi 20" Industrial Floor Blower Fan',
    releaseDate: '2026-10-28T09:00:00Z',
    expectedReturnDate: '2026-11-04T17:00:00Z',
    actualReturnDate: null,
    conditionAtRelease: 'Excellent',
    conditionAtReturn: null,
    status: 'Released',
    digitalSignature: 'SIG-CEU-CHOIR-FAN-VERIFIED-9A2F',
    notes: 'Borrowed for Carmen de Luna Hall choral festival rehearsal'
  }
];

export const CEU_INITIAL_RESERVATIONS = [
  {
    id: 'res-ceu-01',
    assetId: 'ast-ceu-pa-01',
    assetName: 'Yamaha StagePas 600BT Portable PA Sound System',
    userId: 'usr-student-council',
    userName: 'CEU University Student Council (USC)',
    startDate: '2026-11-08T08:00:00Z',
    endDate: '2026-11-10T18:00:00Z',
    purpose: 'CEU Annual University Week Opening Ceremonies & Leadership Summit',
    status: 'Pending',
    approverId: null
  }
];

export const CEU_INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-ceu-01',
    recipientId: 'all',
    type: 'In-App',
    event: 'System Online',
    title: 'SmartLogix CEU Portal Operational',
    message: 'Centralized Logistics, Inventory, and Fleet Tracking is active for Centro Escolar University.',
    level: 'success',
    isRead: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif-ceu-02',
    recipientId: 'role:Logistics/Property Officer',
    type: 'In-App',
    event: 'Maintenance Due',
    title: 'Vehicle Servicing Alert',
    message: 'Isuzu Traviz (NBD-3490) routine servicing scheduled for inter-campus transfer fleet.',
    level: 'warning',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];
