import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  Search, 
  RotateCcw, 
  QrCode, 
  ShieldCheck
} from 'lucide-react';
import { apiService } from '../services/api';
import { fmtDateTime, fmtDate, isOverdue, isOpenLoan, statusBadge, downloadCsv } from '../utils/format';

const LogbookPage = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadTransactions = async () => {
    setLoading(false);
    try {
      const data = await apiService.getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const totalMovements = transactions.length;
  const overdueCount = transactions.filter(isOverdue).length;
  const activeLoans = transactions.filter(isOpenLoan).length;
  const returnedCount = transactions.filter(t => t.status === 'Returned').length;

  const filtered = transactions.filter(t => {
    const term = search.toLowerCase();
    const matchesSearch = (t.borrowerName || '').toLowerCase().includes(term) ||
                          (t.assetName || '').toLowerCase().includes(term) ||
                          (t.acknowledgementRef || '').toLowerCase().includes(term) ||
                          (t.digitalSignature || '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCsv = () => {
    if (transactions.length === 0) {
      alert('No logbook records to export.');
      return;
    }
    const headers = ['Receipt Ref', 'Borrower', 'Asset Name', 'Release Date', 'Expected Return', 'Actual Return', 'Condition Release', 'Condition Return', 'Status', 'Signature'];
    const rows = transactions.map(t => [
      t.acknowledgementRef || t.id,
      t.borrowerName,
      t.assetName,
      t.releaseDate,
      t.expectedReturnDate,
      t.actualReturnDate || '',
      t.conditionAtRelease,
      t.conditionAtReturn || '',
      t.status,
      t.digitalSignature || ''
    ]);
    downloadCsv(`smartlogix-digital-logbook-${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  };

  const handleReturn = async (trx) => {
    try {
      await apiService.returnTransaction(trx.id, { conditionAtReturn: 'Good' });
      await loadTransactions();
    } catch (err) {
      alert(`Cannot return asset: ${err.message}`);
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Digital Logbook</h1>
          <p className="page-subtitle">Audited timeline of asset check-outs, returns, and digital cryptographic signatures</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleExportCsv} className="btn btn-secondary">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => navigate('/qr-scan')} className="btn btn-primary">
            <QrCode size={16} /> QR Handoff
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="card-level-1">
          <span className="stat-label">Total Transactions</span>
          <strong className="stat-value">{totalMovements}</strong>
        </div>
        <div className="card-level-1">
          <span className="stat-label">Active Open Loans</span>
          <strong className="stat-value" style={{ color: 'var(--color-primary)' }}>{activeLoans}</strong>
        </div>
        <div className="card-level-1">
          <span className="stat-label">Returned & Restocked</span>
          <strong className="stat-value" style={{ color: 'var(--color-secondary)' }}>{returnedCount}</strong>
        </div>
        <div className="card-level-1" style={{ border: overdueCount > 0 ? '1px solid var(--color-error)' : '1px solid var(--border-color)' }}>
          <span className="stat-label" style={{ color: overdueCount > 0 ? 'var(--color-error)' : 'var(--text-muted)' }}>Overdue Exceptions</span>
          <strong className="stat-value" style={{ color: overdueCount > 0 ? 'var(--color-error)' : 'inherit' }}>{overdueCount}</strong>
        </div>
      </div>

      {/* Main Container */}
      <div className="card-level-1" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Filters Bar */}
        <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by borrower, asset, or receipt code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ width: '180px' }}>
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="search-input"
            >
              <option value="All">All Statuses</option>
              <option value="Released">Released (Active)</option>
              <option value="Returned">Returned</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <button onClick={loadTransactions} className="btn btn-secondary btn-sm">Refresh</button>
        </div>

        {/* Logbook Table */}
        {loading ? (
          <div className="loading-state">Loading digital logbook entries...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <ShieldCheck size={42} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
            <strong>No logbook records found</strong>
            <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
              {transactions.length === 0 ? "When assets are checked out via QR scan or Inventory, verified receipts will appear here." : "No records match your filter criteria."}
            </p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>RECEIPT REF</th>
                  <th>BORROWER</th>
                  <th>ASSET</th>
                  <th>RELEASE DATE</th>
                  <th>EXPECTED RETURN</th>
                  <th>STATUS</th>
                  <th>SIGNATURE HASH</th>
                  <th style={{ textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(trx => (
                  <tr key={trx.id}>
                    <td>
                      <strong style={{ color: 'var(--color-primary)', fontFamily: 'monospace' }}>
                        {trx.acknowledgementRef || trx.id.slice(0, 8)}
                      </strong>
                    </td>
                    <td style={{ fontWeight: 600 }}>{trx.borrowerName}</td>
                    <td>{trx.assetName || (trx.asset && trx.asset.name) || 'Asset'}</td>
                    <td>{fmtDateTime(trx.releaseDate)}</td>
                    <td>
                      <span style={{ color: isOverdue(trx) ? 'var(--color-error)' : 'inherit', fontWeight: isOverdue(trx) ? 700 : 'normal' }}>
                        {fmtDateTime(trx.expectedReturnDate)}
                      </span>
                    </td>
                    <td><span className={`badge ${statusBadge(trx.status)}`}>{trx.status}</span></td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {trx.digitalSignature ? trx.digitalSignature.slice(0, 16) + '...' : '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isOpenLoan(trx) && (
                        <button 
                          onClick={() => handleReturn(trx)}
                          className="btn btn-secondary btn-sm"
                          title="Check In Asset"
                        >
                          <RotateCcw size={14} /> Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Showing {filtered.length} of {transactions.length} verified transactions</span>
        </div>

      </div>
    </div>
  );
};

export default LogbookPage;
