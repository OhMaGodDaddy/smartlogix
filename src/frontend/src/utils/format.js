const DATE_OPTIONS = { year: 'numeric', month: 'short', day: 'numeric' };
const TIME_OPTIONS = { hour: '2-digit', minute: '2-digit' };

export const fmtDate = (value) => (value ? new Date(value).toLocaleDateString(undefined, DATE_OPTIONS) : '—');
export const fmtTime = (value) => (value ? new Date(value).toLocaleTimeString([], TIME_OPTIONS) : '—');
export const fmtDateTime = (value) => (value ? `${fmtDate(value)}, ${fmtTime(value)}` : '—');

export function timeAgo(value) {
  if (!value) return '';
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return fmtDate(value);
}

/** Value for <input type="datetime-local">, in the user's local time zone. */
export function toDateTimeInput(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const OPEN_LOAN_STATUSES = ['Released', 'Overdue'];

/** A loan is overdue once its due date has passed, even before the server flags it. */
export const isOverdue = (trx) =>
  OPEN_LOAN_STATUSES.includes(trx.status) && new Date(trx.expectedReturnDate) < new Date();

export const isOpenLoan = (trx) => OPEN_LOAN_STATUSES.includes(trx.status);

const BADGE_BY_STATUS = {
  Available: 'badge-success',
  Approved: 'badge-success',
  Returned: 'badge-success',
  Completed: 'badge-success',
  Borrowed: 'badge-info',
  Released: 'badge-info',
  Inspection: 'badge-info',
  'In Transit': 'badge-info',
  Reserved: 'badge-warning',
  Maintenance: 'badge-warning',
  Pending: 'badge-warning',
  Overdue: 'badge-error',
  Rejected: 'badge-error',
  Lost: 'badge-error',
  Unavailable: 'badge-error',
  'Out of Service': 'badge-error'
};

export const statusBadge = (status) => BADGE_BY_STATUS[status] || 'badge-muted';

export const ASSET_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Requires Repair'];
export const ASSET_STATUSES = ['Available', 'Maintenance', 'Inspection', 'Unavailable', 'Lost'];

export const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#94a3b8'];

/** Counts items by key and returns [{ label, count }] sorted from most to least common. */
export function countBy(items, getKey) {
  const counts = new Map();
  items.forEach((item) => {
    const key = getKey(item) || 'Uncategorised';
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function downloadCsv(filename, rows) {
  const escape = (cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`;
  const csv = rows.map((row) => row.map(escape).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

