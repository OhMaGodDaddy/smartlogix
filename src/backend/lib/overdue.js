const { Op } = require('sequelize');
const { Transaction } = require('../inventory-service/models');
const { notify, ROLES } = require('./notify');

/**
 * Flags released loans whose expected return date has passed as Overdue and raises a
 * notification (once, because the status change is what prevents a repeat).
 */
async function refreshOverdue() {
  const late = await Transaction.findAll({
    where: { status: 'Released', expectedReturnDate: { [Op.lt]: new Date() } }
  });

  for (const trx of late) {
    await trx.update({ status: 'Overdue' });
    const message = `${trx.assetName || 'An asset'} borrowed by ${trx.borrowerName || trx.borrowerId} was due ${trx.expectedReturnDate.toISOString()}.`;
    await notify({ recipientId: ROLES.OFFICER, title: 'Asset return overdue', message, level: 'warning', event: 'Overdue Asset' });
    await notify({ recipientId: trx.borrowerId, title: 'Your return is overdue', message, level: 'warning', event: 'Overdue Asset' });
  }

  return late.length;
}

module.exports = { refreshOverdue };

