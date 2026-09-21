import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Server, AlertCircle, Activity, PackageCheck } from 'lucide-react';
import StatCard from '../components/StatCard';
import { apiService } from '../services/api';

const AdminDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    Promise.all([apiService.getAssets(), apiService.getTransactions()]).then(([a, t]) => {
      setAssets(a);
      setTransactions(t);
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Administrator System Control</h1>
          <p className="page-subtitle">Global system overview, service health, user access, and audit records</p>
        </div>
        <span className="badge badge-available" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <ShieldCheck size={16} /> Admin Privileges Active
        </span>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <StatCard title="Total Registered Users" value="148" icon={Users} color="#6366f1" change="+12 this month" />
        <StatCard title="Active Microservices" value="4 / 4" icon={Server} color="#10b981" subtitle="All HTTP REST APIs Healthy" />
        <StatCard title="Total Cataloged Assets" value={assets.length} icon={PackageCheck} color="#06b6d4" />
        <StatCard title="Overdue Handoff Alerts" value={transactions.filter(t => t.status === 'Overdue').length} icon={AlertCircle} color="#ef4444" change="Action Required" />
      </div>

      <div className="grid-2">
        {/* System Services Status */}
        <div className="glass-card">
          <div className="glass-card-header">
            <h3 className="glass-card-title">Microservices Architecture Status</h3>
            <Activity size={18} color="#a5b4fc" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>auth-service</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Port 5001 • SSO & RBAC Logins</span>
              </div>
              <span className="badge badge-available">Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>inventory-service</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Port 5002 • Assets & Digital Logbooks</span>
              </div>
              <span className="badge badge-available">Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>vehicle-service</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Port 5003 • Fleet & Maintenance</span>
              </div>
              <span className="badge badge-available">Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>notification-service</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Port 5004 • Email & SMS Gateways</span>
              </div>
              <span className="badge badge-available">Online</span>
            </div>
          </div>
        </div>

        {/* Global Audit Log */}
        <div className="glass-card">
          <div className="glass-card-header">
            <h3 className="glass-card-title">Recent System Audit Stream</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {transactions.map(trx => (
              <div key={trx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{trx.borrowerName} • {trx.assetName}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Digital Signature: {trx.digitalSignature}</span>
                </div>
                <span className={`badge badge-${trx.status.toLowerCase()}`}>{trx.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
