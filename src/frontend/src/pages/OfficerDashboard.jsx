import React, { useState, useEffect } from 'react';
import { Package, QrCode, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import AssetCard from '../components/AssetCard';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const OfficerDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([apiService.getAssets(), apiService.getTransactions()]).then(([a, t]) => {
      setAssets(a);
      setTransactions(t);
    });
  }, []);

  const availableCount = assets.filter(a => a.status === 'Available').length;
  const borrowedCount = assets.filter(a => a.status === 'Borrowed').length;
  const maintenanceCount = assets.filter(a => a.status === 'Maintenance').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Logistics & Property Officer Workspace</h1>
          <p className="page-subtitle">Manage asset inventory, digital logbook releases, returns, and physical handoffs</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/qr-scan')} className="btn btn-primary">
            <QrCode size={18} /> QR Quick Checkout
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Available Items in Vault" value={availableCount} icon={Package} color="#10b981" />
        <StatCard title="Currently Borrowed" value={borrowedCount} icon={ArrowUpRight} color="#06b6d4" />
        <StatCard title="Items Due Today / Overdue" value={transactions.length} icon={Clock} color="#f59e0b" />
        <StatCard title="Under Maintenance" value={maintenanceCount} icon={ArrowDownLeft} color="#ef4444" />
      </div>

      {/* Digital Logbook Activity */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="glass-card-header">
          <h3 className="glass-card-title">Digital Logbook Recent Transactions</h3>
        </div>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt Ref</th>
                <th>Borrower</th>
                <th>Asset Tag & Name</th>
                <th>Release Date</th>
                <th>Expected Return</th>
                <th>Status</th>
                <th>Handoff Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(trx => (
                <tr key={trx.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{trx.acknowledgementRef}</td>
                  <td>{trx.borrowerName}</td>
                  <td><strong>{trx.assetName}</strong></td>
                  <td>{new Date(trx.releaseDate).toLocaleDateString()}</td>
                  <td>{new Date(trx.expectedReturnDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${trx.status.toLowerCase()}`}>{trx.status}</span>
                  </td>
                  <td>
                    <button onClick={() => navigate(`/qr-scan?assetId=${trx.assetId}`)} className="btn btn-secondary btn-sm">
                      Process Handoff
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Inventory Catalog Grid */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Property Inventory Catalog</h3>
        <div className="grid-3">
          {assets.map(asset => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
