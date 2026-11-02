const { Asset, Reservation, Transaction } = require('../inventory-service/models');
const { Vehicle } = require('../vehicle-service/models');
const { NotificationLog } = require('../notification-service/models');

/**
 * Seeds initial Centro Escolar University (CEU) inventory, vehicle fleet,
 * and sample logbook transactions if the database tables are empty.
 */
async function seedCEUData() {
  const assetCount = await Asset.count();
  if (assetCount === 0) {
    console.log('[Seed] Populating Centro Escolar University (CEU) inventory assets...');
    await Asset.bulkCreate([
      {
        assetTag: 'AST-FAN-01',
        name: 'Standard 24" Industrial Heavy-Duty Stand Fan',
        category: 'Facility Equipment',
        description: 'High-velocity 3-speed oscillating industrial metal stand fan for university gymnasium events and student assemblies',
        location: 'CEU Manila - Student Activity Center (SAC) Gym',
        status: 'Available',
        condition: 'Good',
        qrCodeRef: 'QR-AST-FAN-01-CEU',
        acquisitionDate: '2025-03-10',
        acquisitionCost: 6500.00
      },
      {
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
        assetTag: 'AST-FAN-03',
        name: 'Standard 24" Industrial Stand Fan - Unit 2',
        category: 'Facility Equipment',
        description: 'Heavy-duty industrial fan assigned to the science building ground lobby (oscillation gearbox maintenance pending)',
        location: 'CEU Generosa de Leon Science Complex',
        status: 'Maintenance',
        condition: 'Requires Repair',
        qrCodeRef: 'QR-AST-FAN-03-CEU',
        acquisitionDate: '2024-08-22',
        acquisitionCost: 6500.00
      },
      {
        assetTag: 'AST-PROJ-01',
        name: 'Epson EB-2250U 5000-Lumen Full HD Projector',
        category: 'AV & Multi-Media',
        description: 'High-brightness WUXGA laser presentation projector with dual HDMI for medical symposiums and accreditation presentations',
        location: 'CEU North Building - Audio-Visual Room 3',
        status: 'Available',
        condition: 'Excellent',
        qrCodeRef: 'QR-AST-PROJ-01-CEU',
        acquisitionDate: '2025-01-15',
        acquisitionCost: 68000.00
      },
      {
        assetTag: 'AST-MIC-01',
        name: 'Olympus CX23 Binocular Compound Microscope',
        category: 'Laboratory Equipment',
        description: 'LED optical laboratory microscope for medical technology, pharmacy, and biological science practical examinations',
        location: 'College of Pharmacy - MedTech Lab 401',
        status: 'Available',
        condition: 'Good',
        qrCodeRef: 'QR-AST-MIC-01-CEU',
        acquisitionDate: '2024-11-20',
        acquisitionCost: 45000.00
      },
      {
        assetTag: 'AST-DENT-01',
        name: 'Belmont Pre-Clinical Dental Simulator Phantom Head',
        category: 'Medical & Dental',
        description: 'Anatomical patient simulator with high-speed turbine handpiece mount for clinical dentistry prosthodontics training',
        location: 'CEU College of Dentistry - Simulation Lab 2',
        status: 'Available',
        condition: 'Good',
        qrCodeRef: 'QR-AST-DENT-01-CEU',
        acquisitionDate: '2024-09-12',
        acquisitionCost: 110000.00
      },
      {
        assetTag: 'AST-PA-01',
        name: 'Yamaha StagePas 600BT Portable PA Sound System',
        category: 'AV & Multi-Media',
        description: 'Dual 340W powered mixer speakers with Shure wireless handheld microphone kit for university events',
        location: 'Mendiola Property Custodian Office',
        status: 'Reserved',
        condition: 'Good',
        qrCodeRef: 'QR-AST-PA-01-CEU',
        acquisitionDate: '2025-02-05',
        acquisitionCost: 58000.00
      },
      {
        assetTag: 'AST-TAB-01',
        name: 'Lifetime 6ft Heavy Duty Folding Seminar Tables (Set of 10)',
        category: 'Events & Staging',
        description: 'Heavy-duty blow-molded banquet tables for university career fairs, enrollment centers, and graduation registration',
        location: 'Central Property Warehouse - Bay 4',
        status: 'Available',
        condition: 'Good',
        qrCodeRef: 'QR-AST-TAB-01-CEU',
        acquisitionDate: '2024-06-14',
        acquisitionCost: 35000.00
      },
      {
        assetTag: 'AST-PALLET-01',
        name: 'Noblelift 2.5-Ton Hydraulic Manual Pallet Jack',
        category: 'Property Logistics',
        description: 'Heavy materials handling pallet truck for bulk university delivery intake and warehouse staging',
        location: 'CEU Central Warehouse - Loading Dock',
        status: 'Available',
        condition: 'Good',
        qrCodeRef: 'QR-AST-PALLET-01-CEU',
        acquisitionDate: '2023-10-30',
        acquisitionCost: 24000.00
      }
    ]);
  }

  const vehicleCount = await Vehicle.count();
  if (vehicleCount === 0) {
    console.log('[Seed] Populating Centro Escolar University (CEU) fleet vehicles...');
    await Vehicle.bulkCreate([
      {
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
    ]);
  }

  const trxCount = await Transaction.count();
  if (trxCount === 0) {
    const fanAsset = await Asset.findOne({ where: { assetTag: 'AST-FAN-02' } });
    if (fanAsset) {
      await Transaction.create({
        borrowerId: 'usr-borrower-01',
        borrowerName: 'Prof. Maria Elena Santos (CEU Choir)',
        assetId: fanAsset.id,
        assetName: fanAsset.name,
        releasedBy: 'usr-officer-01',
        releasedByName: 'Mark Miguel (CEU Property Office)',
        releaseDate: new Date('2026-10-28T09:00:00Z'),
        expectedReturnDate: new Date('2026-11-04T17:00:00Z'),
        conditionAtRelease: 'Excellent',
        status: 'Released',
        acknowledgementRef: 'REC-CEU-2026-001',
        digitalSignature: 'SIG-CEU-CHOIR-FAN-VERIFIED',
        notes: 'Borrowed for Carmen de Luna Hall choral festival rehearsal'
      });
    }
  }

  const notifCount = await NotificationLog.count();
  if (notifCount === 0) {
    await NotificationLog.bulkCreate([
      {
        recipientId: 'all',
        type: 'In-App',
        event: 'System Initialized',
        title: 'SmartLogix CEU Portal Online',
        message: 'Centralized Logistics, Inventory, and Fleet Tracking is operational for Centro Escolar University.',
        level: 'success',
        status: 'Sent',
        sentAt: new Date()
      },
      {
        recipientId: 'role:Logistics/Property Officer',
        type: 'In-App',
        event: 'Fleet Maintenance Due',
        title: 'Vehicle Maintenance Scheduled',
        message: 'Isuzu Traviz (NBD-3490) routine servicing scheduled for inter-campus transfer fleet.',
        level: 'warning',
        status: 'Sent',
        sentAt: new Date(Date.now() - 3600000)
      }
    ]);
  }
}

module.exports = { seedCEUData };
