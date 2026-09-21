const sequelize = require('../config/database');
const Asset = require('./Asset');
const Reservation = require('./Reservation');
const Transaction = require('./Transaction');

// Define Table Relationships / Associations

// Asset <-> Reservation (1:N)
Asset.hasMany(Reservation, {
  foreignKey: 'assetId',
  as: 'reservations',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
Reservation.belongsTo(Asset, {
  foreignKey: 'assetId',
  as: 'asset'
});

// Asset <-> Transaction (1:N)
Asset.hasMany(Transaction, {
  foreignKey: 'assetId',
  as: 'transactions',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
Transaction.belongsTo(Asset, {
  foreignKey: 'assetId',
  as: 'asset'
});

// Reservation <-> Transaction (1:1 optional link)
Reservation.hasOne(Transaction, {
  foreignKey: 'reservationId',
  as: 'transaction',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Transaction.belongsTo(Reservation, {
  foreignKey: 'reservationId',
  as: 'reservation'
});

module.exports = {
  sequelize,
  Asset,
  Reservation,
  Transaction
};
