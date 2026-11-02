import React, { useState, useEffect } from 'react';
import { PlusCircle, Clock, CheckCircle2, Bookmark, Search, Package } from 'lucide-react';
import StatCard from '../components/StatCard';
import AssetCard from '../components/AssetCard';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fmtDate, statusBadge } from '../utils/format';

const BorrowerDashboard = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      apiService.getAssets().catch(() => []),
      apiService.getReservations().catch(() => []),
      apiService.getTransactions().catch(() => [])
    ]).then(([a, r, t]) => {
      setAssets(Array.isArray(a) ? a : []);
      const allR = Array.isArray(r) ? r : [];
      const allT = Array.isArray(t) ? t : [];
      setReservations(allR.filter(item => item.userId === user?.id || item.userName === user?.name));
      setTransactions(allT.filter(item => item.borrowerId === user?.id || item.borrowerName === user?.name));
      setLoading(false);
    });
  }, [user]);

  const filteredAssets = assets.filter(a => 
    (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (a.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeBorrowed = transactions.filter(t => t.status === 'Released' || t.status === 'Overdue');
  const pendingReservations = reservations.filter(r => r.status === 'Pending');
  const completedReturns = transactions.filter(t => t.status === 'Returned');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Requester Portal</h1>
          <p className="page-subtitle">Welcome back, {user?.name || 'Requester'}! Manage your active borrowings and resource reservations.</p>
        </div>
        <button onClick={() => navigate('/request')} className="btn btn-primary">
          <PlusCircle size={18} /> Submit New Request
        </button>
      </div>

      <div className="stats-grid">
        <StatCard title="My Active Borrowed Items" value={loading ? '—' : activeBorrowed.length} icon={Clock} color="#06b6d4" />
        <StatCard title="My Pending Reservations" value={loading ? '—' : pendingReservations.length} icon={Bookmark} color="#f59e0b" />
        <StatCard title="Completed Returns" value={loading ? '—' : completedReturns.length} icon={CheckCircle2} color="#10b981" />
      </div>

      {/* Active Borrowings Banner */}
      {activeBorrowed.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div className="glass-card-header">
            <h3 className="glass-card-title">My Currently Borrowed Equipment</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {activeBorrowed.map(trx => (
              <div key={trx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'var(--surface-low)', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{trx.assetName}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Expected Return: <strong style={{ color: trx.status === 'Overdue' ? 'var(--color-error)' : 'inherit' }}>{fmtDate(trx.expectedReturnDate)}</strong>
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`badge ${statusBadge(trx.status)}`}>{trx.status}</span>
                  <button onClick={() => navigate(`/qr-scan?qrRef=${trx.assetId}`)} className="btn btn-secondary btn-sm">
                    View Handoff Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Asset Search Catalog */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Browse Available Assets</h3>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search assets, category, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading catalog...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="glass-card empty-state">
            <Package size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
            <strong>No assets found</strong>
            <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
              {assets.length === 0 ? 'No assets have been added to the system yet.' : 'No assets match your search.'}
            </p>
          </div>
        ) : (
          <div className="grid-3">
            {filteredAssets.map(asset => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowerDashboard;
