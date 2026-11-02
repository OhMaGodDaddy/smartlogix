import React, { useState, useEffect } from 'react';
import { Package, QrCode, ArrowUpRight, ArrowDownLeft, Clock, Plus } from 'lucide-react';
import StatCard from '../components/StatCard';
import AssetCard from '../components/AssetCard';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { fmtDate, statusBadge } from '../utils/format';

const OfficerDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      apiService.getAssets().catch(() => []),
      apiService.getTransactions().catch(() => [])
    ]).then(([a, t]) => {
      setAssets(Array.isArray(a) ? a : []);
      setTransactions(Array.isArray(t) ? t : []);
      setLoading(false);
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
        <StatCard title="Available Items in Vault" value={loading ? '—' : availableCount} icon={Package} color="#10b981" />
        <StatCard title="Currently Borrowed" value={loading ? '—' : borrowedCount} icon={ArrowUpRight} color="#06b6d4" />
        <StatCard title="Active Logbook Records" value={loading ? '—' : transactions.length} icon={Clock} color="#f59e0b" />
        <StatCard title="Under Maintenance" value={loading ? '—' : maintenanceCount} icon={ArrowDownLeft} color="#ef4444" />
      </div>

      {/* Digital Logbook Activity */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="glass-card-header">
          <h3 className="glass-card-title">Digital Logbook Recent Transactions</h3>
        </div>
        {transactions.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '0.85rem' }}>No logbook transactions recorded yet.</p>
          </div>
        ) : (
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
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'monospace' }}>
                      {trx.acknowledgementRef || trx.id.slice(0, 8)}
                    </td>
                    <td>{trx.borrowerName}</td>
                    <td><strong>{trx.assetName}</strong></td>
                    <td>{fmtDate(trx.releaseDate)}</td>
                    <td>{fmtDate(trx.expectedReturnDate)}</td>
                    <td>
                      <span className={`badge ${statusBadge(trx.status)}`}>{trx.status}</span>
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
        )}
      </div>

      {/* Asset Inventory Catalog Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Property Inventory Catalog</h3>
          <button onClick={() => navigate('/inventory?action=new')} className="btn btn-secondary btn-sm">
            <Plus size={14} /> Add Asset
          </button>
        </div>
        {assets.length === 0 ? (
          <div className="glass-card empty-state">
            <Package size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
            <strong>No assets in catalog</strong>
            <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>Click 'Add Asset' or visit Inventory to register equipment.</p>
          </div>
        ) : (
          <div className="grid-3">
            {assets.map(asset => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;
