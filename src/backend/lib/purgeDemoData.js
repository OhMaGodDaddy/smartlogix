const { Asset } = require('../inventory-service/models');
const { Vehicle } = require('../vehicle-service/models');

/**
 * One-off clean-up for databases that were seeded by an earlier version of the gateway.
 * Enabled by setting PURGE_DEMO_DATA=true; matches the exact seeded records only, and
 * leaves any record that already has loan or reservation history untouched.
 */
const DEMO_ASSET_QR_REFS = [
  'QR-AST-101-EPSON',
  'QR-AST-102-DELL',
  'QR-AST-103-SONY',
  'QR-AST-104-SHURE',
  'QR-AST-105-RIGOL'
];
const DEMO_VEHICLE_PLATES = ['WQC-4109', 'NDX-8821', 'TGB-5510'];

async function purgeDemoData() {
  let removedAssets = 0;
  for (const asset of await Asset.findAll({ where: { qrCodeRef: DEMO_ASSET_QR_REFS } })) {
    try {
      await asset.destroy();
      removedAssets += 1;
    } catch (err) {
      console.warn(`[Purge] Kept ${asset.assetTag}: ${err.message}`);
    }
  }
  const removedVehicles = await Vehicle.destroy({ where: { plateNumber: DEMO_VEHICLE_PLATES } });
  console.log(`[Purge] Removed ${removedAssets} demo assets and ${removedVehicles} demo vehicles.`);
}

module.exports = { purgeDemoData };

