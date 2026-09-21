import React, { useState, useEffect } from 'react';
import { CheckSquare, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import StatCard from '../components/StatCard';
import { apiService } from '../services/api';

const ApproverDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [rejectReason, setRejectReason] = useState({});

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = () => {
    apiService.getReservations().then(setReservations);
  };

  const handleApprove = (id) => {
    apiService.updateReservationStatus(id, 'Approved').then(() => {
      loadReservations();
    });
  };

  const handleReject = (id) => {
    const reason = rejectReason[id] || 'Scheduling conflict or resource unavailable';
    apiService.updateReservationStatus(id, 'Rejected', reason).then(() => {
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
        <span className="badge badge-pending" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <Clock size={16} /> {pendingList.length} Pending Review
        </span>
      </div>

      <div className="stats-grid">
        <StatCard title="Requests Pending Review" value={pendingList.length} icon={Clock} color="#f59e0b" />
        <StatCard title="Approved This Month" value={approvedList.length} icon={CheckCircle} color="#10b981" />
        <StatCard title="Rejected / Returned" value={rejectedList.length} icon={XCircle} color="#ef4444" />
      </div>

      {/* Pending Approvals Table */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="glass-card-header">
          <h3 className="glass-card-title">Pending Resource Reservation Requests</h3>
        </div>

        {pendingList.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            No pending requests requiring review at this time.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {pendingList.map(item => (
              <div 
                key={item.id} 
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: '1.25rem' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span className="badge badge-pending" style={{ marginBottom: '0.4rem' }}>{item.id}</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.assetName}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Requested by: <strong style={{ color: 'var(--text-primary)' }}>{item.userName}</strong>
                    </p>
                  </div>
                  <div style={{ textAlignment: 'right', fontSize: '0.85rem', color: '#a5b4fc' }}>
                    <div>From: {new Date(item.startDate).toLocaleString()}</div>
                    <div>To: {new Date(item.endDate).toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} color="#6366f1" />
                  <span>Purpose: {item.purpose}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button onClick={() => handleApprove(item.id)} className="btn btn-success btn-sm">
                    <CheckCircle size={16} /> Approve Request
                  </button>
                  <button onClick={() => handleReject(item.id)} className="btn btn-danger btn-sm">
                    <XCircle size={16} /> Reject Request
                  </button>
                  <input 
                    type="text" 
                    placeholder="Optional rejection reason..." 
                    value={rejectReason[item.id] || ''}
                    onChange={(e) => setRejectReason({ ...rejectReason, [item.id]: e.target.value })}
                    className="form-control"
                    style={{ flex: 1, padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
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
          <h3 className="glass-card-title">Recent Approval History</h3>
        </div>
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
                  <td>{r.id}</td>
                  <td><strong>{r.assetName}</strong></td>
                  <td>{r.userName}</td>
                  <td>{new Date(r.startDate).toLocaleDateString()} - {new Date(r.endDate).toLocaleDateString()}</td>
                  <td><span className={`badge badge-${r.status.toLowerCase()}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApproverDashboard;
