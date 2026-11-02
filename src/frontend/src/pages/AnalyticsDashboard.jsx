import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Package, CheckCircle } from 'lucide-react';
import StatCard from '../components/StatCard';
import { apiService } from '../services/api';
import { isOverdue } from '../utils/format';

const AnalyticsDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const totalAssets = assets.length;
  const availableCount = assets.filter(a => a.status === 'Available').length;
  const borrowedCount = assets.filter(a => a.status === 'Borrowed').length;
  const reservedCount = assets.filter(a => a.status === 'Reserved').length;
  const maintenanceCount = assets.filter(a => a.status === 'Maintenance').length;
  const overdueCount = transactions.filter(isOverdue).length;

  const utilizationRate = totalAssets > 0 ? Math.round(((borrowedCount + reservedCount) / totalAssets) * 100) : 0;

  // Real category counts
  const categoryCounts = assets.reduce((acc, a) => {
    const cat = a.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & Logistics Metrics</h1>
          <p className="page-subtitle">Real-time asset utilization, borrowing frequency, and inventory status breakdown</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Total System Assets" value={loading ? '—' : totalAssets} icon={Package} color="#6366f1" />
        <StatCard title="Asset Utilization Rate" value={loading ? '—' : `${utilizationRate}%`} icon={TrendingUp} color="#10b981" />
        <StatCard title="Currently Borrowed" value={loading ? '—' : borrowedCount} icon={CheckCircle} color="#06b6d4" />
        <StatCard title="Overdue Returns" value={loading ? '—' : overdueCount} icon={AlertTriangle} color="#ef4444" />
      </div>

      <div className="grid-2">
        {/* Status Breakdown Bar */}
        <div className="glass-card">
          <div className="glass-card-header">
            <h3 className="glass-card-title">Inventory Status Breakdown</h3>
            <BarChart3 size={18} color="var(--color-primary)" />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span>Available Assets</span>
                <strong style={{ color: 'var(--color-secondary)' }}>
                  {availableCount} ({totalAssets ? Math.round((availableCount/totalAssets)*100) : 0}%)
                </strong>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ background: '#10b981', width: `${totalAssets ? (availableCount/totalAssets)*100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span>Borrowed Equipment</span>
                <strong style={{ color: '#06b6d4' }}>
                  {borrowedCount} ({totalAssets ? Math.round((borrowedCount/totalAssets)*100) : 0}%)
                </strong>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ background: '#06b6d4', width: `${totalAssets ? (borrowedCount/totalAssets)*100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span>Reserved Items</span>
                <strong style={{ color: '#f59e0b' }}>
                  {reservedCount} ({totalAssets ? Math.round((reservedCount/totalAssets)*100) : 0}%)
                </strong>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ background: '#f59e0b', width: `${totalAssets ? (reservedCount/totalAssets)*100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span>Under Maintenance</span>
                <strong style={{ color: '#ef4444' }}>
                  {maintenanceCount} ({totalAssets ? Math.round((maintenanceCount/totalAssets)*100) : 0}%)
                </strong>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ background: '#ef4444', width: `${totalAssets ? (maintenanceCount/totalAssets)*100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Equipment Categories */}
        <div className="glass-card">
          <div className="glass-card-header">
            <h3 className="glass-card-title">Cataloged Equipment Categories</h3>
          </div>
          
          {sortedCategories.length === 0 ? (
            <div className="empty-state">
              <Package size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
              <p style={{ fontSize: '0.85rem' }}>No equipment categories cataloged yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
              {sortedCategories.map(([category, count]) => {
                const pct = totalAssets ? Math.round((count / totalAssets) * 100) : 0;
                return (
                  <div key={category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--surface-low)', borderRadius: '8px' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem' }}>{category}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{count} unit{count === 1 ? '' : 's'} registered</span>
                    </div>
                    <span className="badge badge-info">{pct}% of catalog</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
