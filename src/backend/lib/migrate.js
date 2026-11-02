const { QueryTypes } = require('sequelize');

/**
 * Lightweight, idempotent schema upgrades.
 *
 * `sequelize.sync()` only creates missing tables, it never alters existing ones, and
 * `sync({ alter: true })` is unsafe on PostgreSQL (it re-adds unique constraints on every
 * boot). Databases created by earlier versions of the models are upgraded here instead.
 * On a fresh database every statement below is a no-op.
 */

// Columns that used to be UUIDs but now hold free-form user identifiers.
const UUID_TO_TEXT = [
  ['assets', 'currentHolderId'],
  ['reservations', 'userId'],
  ['reservations', 'approverId'],
  ['transactions', 'borrowerId'],
  ['transactions', 'releasedBy'],
  ['vehicles', 'assignedDriverId'],
  ['notification_logs', 'recipientId']
];

const ADD_COLUMNS = [
  ['assets', 'currentHolderName', 'VARCHAR(255)'],
  ['reservations', 'userName', 'VARCHAR(255)'],
  ['reservations', 'assetName', 'VARCHAR(255)'],
  ['transactions', 'borrowerName', 'VARCHAR(255)'],
  ['transactions', 'assetName', 'VARCHAR(255)'],
  ['transactions', 'releasedByName', 'VARCHAR(255)'],
  ['transactions', 'notes', 'TEXT'],
  ['notification_logs', 'title', 'VARCHAR(255)'],
  ['notification_logs', 'level', "VARCHAR(20) NOT NULL DEFAULT 'info'"],
  ['notification_logs', 'isRead', 'BOOLEAN NOT NULL DEFAULT false']
];

async function getColumnType(sequelize, table, column) {
  const rows = await sequelize.query(
    `SELECT data_type FROM information_schema.columns
     WHERE table_schema = current_schema() AND table_name = :table AND column_name = :column`,
    { replacements: { table, column }, type: QueryTypes.SELECT }
  );
  return rows.length ? rows[0].data_type : null;
}

async function migrate(sequelize) {
  for (const [table, column] of UUID_TO_TEXT) {
    if ((await getColumnType(sequelize, table, column)) === 'uuid') {
      await sequelize.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE VARCHAR(255) USING "${column}"::text`
      );
      console.log(`[Migrate] ${table}.${column}: uuid -> varchar`);
    }
  }

  for (const [table, column, definition] of ADD_COLUMNS) {
    if ((await getColumnType(sequelize, table, column)) === null) {
      await sequelize.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${column}" ${definition}`);
      console.log(`[Migrate] added ${table}.${column}`);
    }
  }
}

module.exports = { migrate };

