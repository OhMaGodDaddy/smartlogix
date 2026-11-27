import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Server, AlertCircle, Activity, PackageCheck, RotateCcw, Database } from 'lucide-react';
import StatCard from '../components/StatCard';
import { apiService, API_BASE } from '../services/api';
import { fmtDateTime, statusBadge, isOverdue } from '../utils/format';

const AdminDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [serviceStatus, setServiceStatus] = useState([]);
  const [gatewayHealth, setGatewayHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [probing, setProbing] = useState(false);

  const runHealthCheck = async () => {
    setProbing(true);
    const [s, h] = await Promise.all([
      apiService.checkServices().catch(() => []),
      apiService.getHealth().catch(() => null)
    ]);
    setServiceStatus(Array.isArray(s) ? s : []);
    setGatewayHealth(h);
    setProbing(false);
  };

  useEffect(() => {
    Promise.all([
      apiService.getAssets().catch(() => []),
      apiService.getTransactions().catch(() => []),
      apiService.getUsers().catch(() => []),
      apiService.checkServices().catch(() => []),
      apiService.getHealth().catch(() => null)
    ]).then(([a, t, u, s, h]) => {
      setAssets(Array.isArray(a) ? a : []);
      setTransactions(Array.isArray(t) ? t : []);
      setUsers(Array.isArray(u) ? u : []);
      setServiceStatus(Array.isArray(s) ? s : []);
      setGatewayHealth(h);
      setLoading(false);
    });
  }, []);

  const overdueCount = transactions.filter(isOverdue).length;
  const liveServicesCount = serviceStatus.filter(s => s.liveBackend).length;
  const isLiveGateway = Boolean(gatewayHealth && gatewayHealth.liveGateway);
  const isDbConnected = gatewayHealth?.database === 'connected';

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
          title="Live API Microservices" 
          value={loading ? '—' : `${liveServicesCount} / 4`} 
          icon={Server} 
          color={liveServicesCount === 4 ? '#10b981' : '#f59e0b'} 
          subtitle={
            liveServicesCount === 4
              ? 'Connected to Live PostgreSQL API'
              : isLiveGateway
                ? `Gateway Up (${gatewayHealth?.database || 'DB Connecting'})`
                : 'Running in Local CEU Fallback Mode'
          } 
        />
        <StatCard title="Total Cataloged Assets" value={loading ? '—' : assets.length} icon={PackageCheck} color="#06b6d4" />
        <StatCard title="Overdue Handoff Alerts" value={loading ? '—' : overdueCount} icon={AlertCircle} color="#ef4444" />
      </div>

      <div className="grid-2">
        {/* System Services Status */}
        <div className="glass-card">
          <div className="glass-card-header">
            <div>
              <h3 className="glass-card-title">Microservices Architecture Health</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Target Gateway: <code style={{ color: 'var(--color-primary)' }}>{API_BASE}</code>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={runHealthCheck} disabled={probing} className="btn btn-secondary btn-sm">
                <RotateCcw size={14} /> {probing ? 'Probing...' : 'Test Live Endpoints'}
              </button>
              <Activity size={18} color="var(--color-primary)" />
            </div>
          </div>

          {/* Gateway & Database Banner */}
          <div style={{
            padding: '0.75rem 1rem',
            marginBottom: '0.85rem',
            borderRadius: '8px',
            background: 'var(--surface-low)',
            border: `1px solid ${isDbConnected ? '#10b981' : isLiveGateway ? '#f59e0b' : 'var(--border-color)'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Database size={16} color={isDbConnected ? '#10b981' : '#f59e0b'} />
              <div style={{ fontSize: '0.8rem' }}>
                <strong>API Gateway (`/health`):</strong>{' '}
                {isLiveGateway ? 'Reachable' : 'Unreachable (Offline)'}
                {' • '}
                <strong>PostgreSQL:</strong>{' '}
                {isDbConnected ? 'Connected' : (gatewayHealth?.dbError || gatewayHealth?.database || 'Using Browser LocalStorage')}
              </div>
            </div>
            <span className={`badge ${isDbConnected ? 'badge-success' : 'badge-warning'}`}>
              {isDbConnected ? 'Live Cloud / DB' : 'CEU Fallback Active'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {serviceStatus.map(s => (
              <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--surface-low)', borderRadius: '8px' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>{s.name}</strong>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', fontFamily: 'monospace' }}>
                    {s.endpoint}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: s.liveBackend ? 'var(--color-secondary)' : 'var(--text-muted)' }}>
                    {s.mode} • Probe: {s.latency} ms
                  </span>
                </div>
                <span className={`badge ${s.liveBackend ? 'badge-success' : s.gatewayReachable ? 'badge-warning' : 'badge-info'}`}>
                  {s.liveBackend ? 'Live API Online' : s.gatewayReachable ? 'DB Waiting (Fallback)' : 'Fallback Mode'}
                </span>
              </div>
            ))}
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
