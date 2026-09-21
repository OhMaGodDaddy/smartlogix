import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, AlertTriangle, Package, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import { apiService } from '../services/api';

const AnalyticsDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    Promise.all([apiService.getAssets(), apiService.getTransactions()]).then(([a, t]) => {
      setAssets(a);
      setTransactions(t);
    });
  }, []);

  const totalAssets = assets.length;
  const availableCount = assets.filter(a => a.status === 'Available').length;
  const borrowedCount = assets.filter(a => a.status === 'Borrowed').length;
  const reservedCount = assets.filter(a => a.status === 'Reserved').length;
  const maintenanceCount = assets.filter(a => a.status === 'Maintenance').length;
  const overdueCount = transactions.filter(t => t.status === 'Overdue').length;

  const utilizationRate = totalAssets > 0 ? Math.round(((borrowedCount + reservedCount) / totalAssets) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & Logistics Metrics</h1>
          <p className="page-subtitle">Real-time asset utilization, borrowing frequency, and inventory analytics</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Total System Assets" value={totalAssets} icon={Package} color="#6366f1" />
        <StatCard title="Asset Utilization Rate" value={`${utilizationRate}%`} icon={TrendingUp} color="#10b981" change="+5% vs last week" />
        <StatCard title="Currently Borrowed" value={borrowedCount} icon={PieChart} color="#06b6d4" />
        <StatCard title="Overdue Returns" value={overdueCount} icon={AlertTriangle} color="#ef4444" />
      </div>

      <div className="grid-2">
        {/* Status Breakdown Bar */}
        <div className="glass-card">
          <div className="glass-card-header">
            <h3 className="glass-card-title">Inventory Status Breakdown</h3>
            <BarChart3 size={18} color="#a5b4fc" />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span>Available Assets</span>
                <strong style={{ color: '#34d399' }}>{availableCount} ({totalAssets ? Math.round((availableCount/totalAssets)*100) : 0}%)</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                <div style={{ background: '#10b981', width: `${totalAssets ? (availableCount/totalAssets)*100 : 0}%`, height: '100%' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span>Borrowed Equipment</span>
                <strong style={{ color: '#22d3ee' }}>{borrowedCount} ({totalAssets ? Math.round((borrowedCount/totalAssets)*100) : 0}%)</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                <div style={{ background: '#06b6d4', width: `${totalAssets ? (borrowedCount/totalAssets)*100 : 0}%`, height: '100%' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span>Reserved Items</span>
                <strong style={{ color: '#fbbf24' }}>{reservedCount} ({totalAssets ? Math.round((reservedCount/totalAssets)*100) : 0}%)</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                <div style={{ background: '#f59e0b', width: `${totalAssets ? (reservedCount/totalAssets)*100 : 0}%`, height: '100%' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span>Under Maintenance</span>
                <strong style={{ color: '#f87171' }}>{maintenanceCount} ({totalAssets ? Math.round((maintenanceCount/totalAssets)*100) : 0}%)</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                <div style={{ background: '#ef4444', width: `${totalAssets ? (maintenanceCount/totalAssets)*100 : 0}%`, height: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Most Borrowed Categories */}
        <div className="glass-card">
          <div className="glass-card-header">
            <h3 className="glass-card-title">Top Equipment Categories</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>AV & Projection Equipment</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projectors, Displays, HDMI Adapters</span>
              </div>
              <span className="badge badge-borrowed">High Demand</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Computers & Workstations</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High-spec laptops, Oscilloscopes</span>
              </div>
              <span className="badge badge-available">Moderate</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Media & Photography</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Camera Kits, Microphones, Tripods</span>
              </div>
              <span className="badge badge-reserved">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
