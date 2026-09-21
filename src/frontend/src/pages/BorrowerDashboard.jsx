import React, { useState, useEffect } from 'react';
import { PlusCircle, Clock, CheckCircle2, Bookmark, Search } from 'lucide-react';
import StatCard from '../components/StatCard';
import AssetCard from '../components/AssetCard';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BorrowerDashboard = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      apiService.getAssets(),
      apiService.getReservations(),
      apiService.getTransactions()
    ]).then(([a, r, t]) => {
      setAssets(a);
      setReservations(r.filter(item => item.userId === user.id || item.userName === user.name));
      setTransactions(t.filter(item => item.borrowerId === user.id || item.borrowerName === user.name));
    });
  }, [user]);

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Requester Portal</h1>
          <p className="page-subtitle">Welcome back, {user.name}! Manage your active borrowings and resource reservations.</p>
        </div>
        <button onClick={() => navigate('/request')} className="btn btn-primary">
          <PlusCircle size={18} /> Submit New Request
        </button>
      </div>

      <div className="stats-grid">
        <StatCard title="My Active Borrowed Items" value={transactions.filter(t => t.status === 'Released' || t.status === 'Overdue').length} icon={Clock} color="#06b6d4" />
        <StatCard title="My Pending Reservations" value={reservations.filter(r => r.status === 'Pending').length} icon={Bookmark} color="#f59e0b" />
        <StatCard title="Completed Returns" value="6" icon={CheckCircle2} color="#10b981" />
      </div>

      {/* Active Borrowings Banner */}
      {transactions.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-primary)' }}>
          <div className="glass-card-header">
            <h3 className="glass-card-title">My Currently Borrowed Equipment</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {transactions.map(trx => (
              <div key={trx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{trx.assetName}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Expected Return: <strong style={{ color: trx.status === 'Overdue' ? '#f87171' : '#34d399' }}>{new Date(trx.expectedReturnDate).toLocaleDateString()}</strong>
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={`badge badge-${trx.status.toLowerCase()}`}>{trx.status}</span>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
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

        <div className="grid-3">
          {filteredAssets.map(asset => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BorrowerDashboard;
