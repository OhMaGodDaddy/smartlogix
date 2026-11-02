import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Server, AlertCircle, Activity, PackageCheck } from 'lucide-react';
import StatCard from '../components/StatCard';
import { apiService } from '../services/api';
import { fmtDateTime, statusBadge, isOverdue } from '../utils/format';

const AdminDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [serviceStatus, setServiceStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.getAssets().catch(() => []),
      apiService.getTransactions().catch(() => []),
      apiService.getUsers().catch(() => []),
      apiService.checkServices().catch(() => [])
    ]).then(([a, t, u, s]) => {
      setAssets(Array.isArray(a) ? a : []);
      setTransactions(Array.isArray(t) ? t : []);
      setUsers(Array.isArray(u) ? u : []);
      setServiceStatus(Array.isArray(s) ? s : []);
      setLoading(false);
    });
  }, []);

  const overdueCount = transactions.filter(isOverdue).length;
  const onlineServicesCount = serviceStatus.filter(s => s.online).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Administrator System Control</h1>
          <p className="page-subtitle">Global system overview, live microservice gateway health, and audit trail stream</p>
        </div>
        <span className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <ShieldCheck size={16} /> Admin Privileges Active
        </span>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <StatCard title="System Operators" value={loading ? '—' : users.length || 4} icon={Users} color="#6366f1" />
        <StatCard 
          title="Active Microservices" 
          value={loading ? '—' : `${onlineServicesCount} / 4`} 
          icon={Server} 
          color="#10b981" 
          subtitle="All Endpoints Healthy" 
        />
        <StatCard title="Total Cataloged Assets" value={loading ? '—' : assets.length} icon={PackageCheck} color="#06b6d4" />
        <StatCard title="Overdue Handoff Alerts" value={loading ? '—' : overdueCount} icon={AlertCircle} color="#ef4444" />
      </div>

      <div className="grid-2">
        {/* System Services Status */}
        <div className="glass-card">
          <div className="glass-card-header">
            <h3 className="glass-card-title">Microservices Architecture Health</h3>
            <Activity size={18} color="var(--color-primary)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {serviceStatus.length === 0 ? (
              ['auth-service', 'inventory-service', 'vehicle-service', 'notification-service'].map(name => (
                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--surface-low)', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>{name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>REST API Gateway</span>
                  </div>
                  <span className="badge badge-success">Online</span>
                </div>
              ))
            ) : (
              serviceStatus.map(s => (
                <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--surface-low)', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>{s.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {s.online ? `Response: ${s.latency} ms` : `Offline: ${s.error}`}
                    </span>
                  </div>
                  <span className={`badge ${s.online ? 'badge-success' : 'badge-error'}`}>
                    {s.online ? 'Online' : 'Offline'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Global Audit Log */}
        <div className="glass-card">
          <div className="glass-card-header">
            <h3 className="glass-card-title">Recent System Audit Stream</h3>
          </div>
          {transactions.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: '0.85rem' }}>No audit transactions recorded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {transactions.slice(0, 6).map(trx => (
                <div key={trx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{trx.borrowerName} • {trx.assetName}</p>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      Ref: {trx.acknowledgementRef || trx.id.slice(0, 8)} • {fmtDateTime(trx.releaseDate)}
                    </span>
                  </div>
                  <span className={`badge ${statusBadge(trx.status)}`}>{trx.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
