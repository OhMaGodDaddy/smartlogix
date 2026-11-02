import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import StatCard from '../components/StatCard';
import { apiService } from '../services/api';
import { fmtDateTime, fmtDate, statusBadge } from '../utils/format';
import { useAuth } from '../context/AuthContext';

const ApproverDashboard = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [rejectReason, setRejectReason] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = () => {
    setLoading(true);
    apiService.getReservations()
      .then(data => setReservations(Array.isArray(data) ? data : []))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  };

  const handleApprove = (id) => {
    apiService.updateReservationStatus(id, 'Approved', '', user?.id || 'approver').then(() => {
      loadReservations();
    });
  };

  const handleReject = (id) => {
    const reason = rejectReason[id] || 'Scheduling conflict or resource unavailable';
    apiService.updateReservationStatus(id, 'Rejected', reason, user?.id || 'approver').then(() => {
      loadReservations();
    });
  };

  const pendingList = reservations.filter(r => r.status === 'Pending');
  const approvedList = reservations.filter(r => r.status === 'Approved');
  const rejectedList = reservations.filter(r => r.status === 'Rejected');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Approver Review Portal</h1>
          <p className="page-subtitle">Review, approve, or reject asset borrowing requests and scheduling reservations</p>
        </div>
        <span className="badge badge-warning" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <Clock size={16} /> {pendingList.length} Pending Review
        </span>
      </div>

      <div className="stats-grid">
        <StatCard title="Requests Pending Review" value={loading ? '—' : pendingList.length} icon={Clock} color="#f59e0b" />
        <StatCard title="Approved Requests" value={loading ? '—' : approvedList.length} icon={CheckCircle} color="#10b981" />
        <StatCard title="Rejected Requests" value={loading ? '—' : rejectedList.length} icon={XCircle} color="#ef4444" />
      </div>

      {/* Pending Approvals Table */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="glass-card-header">
          <h3 className="glass-card-title">Pending Resource Reservation Requests</h3>
        </div>

        {loading ? (
          <div className="loading-state">Loading pending review queue...</div>
        ) : pendingList.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            No pending requests requiring review at this time.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {pendingList.map(item => (
              <div 
                key={item.id} 
                style={{ 
                  background: 'var(--surface-low)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '10px', 
                  padding: '1.25rem' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span className="badge badge-warning" style={{ marginBottom: '0.4rem' }}>{item.id.slice(0, 8)}</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{item.assetName}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Requested by: <strong>{item.userName || item.userId}</strong>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div>From: <strong>{fmtDateTime(item.startDate)}</strong></div>
                    <div>To: <strong>{fmtDateTime(item.endDate)}</strong></div>
                  </div>
                </div>

                {item.purpose && (
                  <div style={{ background: 'var(--surface-container)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} color="var(--color-primary)" />
                    <span>Purpose: {item.purpose}</span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button onClick={() => handleApprove(item.id)} className="btn btn-success btn-sm">
                    <CheckCircle size={15} /> Approve Request
                  </button>
                  <button onClick={() => handleReject(item.id)} className="btn btn-danger btn-sm">
                    <XCircle size={15} /> Reject Request
                  </button>
                  <input 
                    type="text" 
                    placeholder="Optional rejection reason..." 
                    value={rejectReason[item.id] || ''}
                    onChange={(e) => setRejectReason({ ...rejectReason, [item.id]: e.target.value })}
                    className="form-control"
                    style={{ flex: 1, minWidth: '200px', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision History Log */}
      <div className="glass-card">
        <div className="glass-card-header">
          <h3 className="glass-card-title">Recent Approval Decisions</h3>
        </div>
        {reservations.filter(r => r.status !== 'Pending').length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
            No prior approval history.
          </p>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Req ID</th>
                  <th>Asset Requested</th>
                  <th>Requester</th>
                  <th>Date Range</th>
                  <th>Decision Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations.filter(r => r.status !== 'Pending').map(r => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'monospace' }}>{r.id.slice(0, 8)}</td>
                    <td><strong>{r.assetName}</strong></td>
                    <td>{r.userName || r.userId}</td>
                    <td>{fmtDate(r.startDate)} – {fmtDate(r.endDate)}</td>
                    <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApproverDashboard;
