import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  CheckCircle, 
  Repeat, 
  AlertTriangle, 
  Wrench, 
  QrCode, 
  Plus, 
  Clock,
  Package,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { apiService } from '../services/api';
import { fmtDate, fmtTime, isOverdue, statusBadge } from '../utils/format';

const DashboardOverviewPage = () => {
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.getAssets().catch(() => []),
      apiService.getTransactions().catch(() => []),
      apiService.getReservations().catch(() => [])
    ]).then(([a, t, r]) => {
      setAssets(Array.isArray(a) ? a : []);
      setTransactions(Array.isArray(t) ? t : []);
      setReservations(Array.isArray(r) ? r : []);
      setLoading(false);
    });
  }, []);

  const totalAssets = assets.length;
  const availableCount = assets.filter(a => a.status === 'Available').length;
  const borrowedCount = assets.filter(a => a.status === 'Borrowed').length;
  const maintenanceCount = assets.filter(a => a.status === 'Maintenance').length;
  const overdueCount = transactions.filter(isOverdue).length;

  // Category breakdown
  const categoryCounts = assets.reduce((acc, a) => {
    const cat = a.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const categoriesList = Object.entries(categoryCounts);

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  // Upcoming pending reservations
  const pendingReservations = reservations.filter(r => r.status === 'Pending').slice(0, 3);

  return (
    <div>
      {/* Action Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Dashboard Overview</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Live status of organizational logistics, equipment inventory, and handoffs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/qr-scan')} className="btn btn-secondary">
            <QrCode size={16} /> Scan QR
          </button>
          <button onClick={() => navigate('/inventory?action=new')} className="btn btn-primary">
            <Plus size={16} /> New Asset
          </button>
        </div>
      </div>

      {/* 5 Metrics Grid */}
      <div className="metrics-grid-5">
        <div className="card-level-1">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>TOTAL ASSETS</span>
            <Layers size={18} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{loading ? '—' : totalAssets}</div>
        </div>

        <div className="card-level-1">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-secondary)' }}>AVAILABLE</span>
            <CheckCircle size={18} color="var(--color-secondary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{loading ? '—' : availableCount}</div>
        </div>

        <div className="card-level-1">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>BORROWED</span>
            <Repeat size={18} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{loading ? '—' : borrowedCount}</div>
        </div>

        <div className="card-level-1" style={{ border: overdueCount > 0 ? '1px solid var(--color-error)' : '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: overdueCount > 0 ? 'var(--color-error)' : 'var(--text-muted)' }}>OVERDUE</span>
            <AlertTriangle size={18} color={overdueCount > 0 ? 'var(--color-error)' : 'var(--text-muted)'} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: overdueCount > 0 ? 'var(--color-error)' : 'inherit' }}>
            {loading ? '—' : overdueCount}
          </div>
        </div>

        <div className="card-level-1">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>MAINTENANCE</span>
            <Wrench size={18} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{loading ? '—' : maintenanceCount}</div>
        </div>
      </div>

      {/* Main Charts & Tables Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        
        {/* Left Column (8 cols): Recent Logbook Activity */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="card-level-1" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Digital Logbook Handoffs</h3>
              <button onClick={() => navigate('/logbook')} className="btn btn-secondary btn-sm">
                View All <ArrowRight size={14} />
              </button>
            </div>

            {loading ? (
              <div className="loading-state">Loading transactions...</div>
            ) : recentTransactions.length === 0 ? (
              <div className="empty-state">
                <Clock size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
                <strong>No checkouts or returns recorded yet</strong>
                <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  Transactions will appear here automatically when assets are released or checked back in.
                </p>
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ASSET</th>
                      <th>ACTION</th>
                      <th>BORROWER</th>
                      <th>DATE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map(trx => (
                      <tr key={trx.id}>
                        <td>
                          <strong>{trx.assetName || (trx.asset && trx.asset.name) || 'Asset'}</strong>
                          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {trx.acknowledgementRef || trx.id.slice(0, 8)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${trx.actualReturnDate ? 'badge-success' : 'badge-info'}`}>
                            {trx.actualReturnDate ? 'Returned' : 'Check-Out'}
                          </span>
                        </td>
                        <td>{trx.borrowerName}</td>
                        <td>{fmtDate(trx.releaseDate)}</td>
                        <td><span className={`badge ${statusBadge(trx.status)}`}>{trx.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="card-level-1">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Quick Operations</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/inventory?action=new')} className="btn btn-secondary" style={{ flex: 1, minWidth: '160px', padding: '0.75rem' }}>
                <Plus size={16} /> Add New Equipment
              </button>
              <button onClick={() => navigate('/request')} className="btn btn-secondary" style={{ flex: 1, minWidth: '160px', padding: '0.75rem' }}>
                <Calendar size={16} /> Submit Reservation
              </button>
              <button onClick={() => navigate('/qr-scan')} className="btn btn-secondary" style={{ flex: 1, minWidth: '160px', padding: '0.75rem' }}>
                <QrCode size={16} /> Verify Asset QR
              </button>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Category Distribution & Pending Requests */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Category Distribution */}
          <div className="card-level-1">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Category Distribution</h3>
            {categoriesList.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                No categories cataloged yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {categoriesList.map(([cat, count]) => {
                  const pct = totalAssets ? Math.round((count / totalAssets) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                        <span>{cat}</span>
                        <strong>{count} ({pct}%)</strong>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${pct}%`, background: 'var(--color-primary)' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Reservations Queue */}
          <div className="card-level-1">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Pending Approvals</h3>
              <button onClick={() => navigate('/requests')} className="btn btn-secondary btn-sm">
                Queue
              </button>
            </div>
            
            {pendingReservations.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                No pending requests requiring review.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pendingReservations.map(res => (
                  <div key={res.id} style={{ padding: '0.65rem', background: 'var(--surface-low)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
                      <span>{res.assetName}</span>
                      <span className="badge badge-warning">Pending</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      Requested by {res.userName || 'Borrower'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardOverviewPage;
