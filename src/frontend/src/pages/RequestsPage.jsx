import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileCheck, 
  Check, 
  X, 
  Plus, 
  FileText,
  ArrowRightLeft
} from 'lucide-react';
import { apiService } from '../services/api';
import { fmtDateTime, statusBadge } from '../utils/format';
import { useAuth } from '../context/AuthContext';

const RequestsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');
  const [rejectReason, setRejectReason] = useState({});
  const [actionError, setActionError] = useState('');

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await apiService.getReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch {
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleApprove = async (id) => {
    setActionError('');
    try {
      await apiService.updateReservationStatus(id, 'Approved', '', user?.id || 'approver');
      await loadReservations();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleReject = async (id) => {
    setActionError('');
    const reason = rejectReason[id] || 'Resource unavailable or schedule conflict';
    try {
      await apiService.updateReservationStatus(id, 'Rejected', reason, user?.id || 'approver');
      await loadReservations();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const filtered = reservations.filter(r => {
    if (activeTab === 'All') return true;
    return r.status === activeTab;
  });

  const pendingCount = reservations.filter(r => r.status === 'Pending').length;
  const approvedCount = reservations.filter(r => r.status === 'Approved').length;

  return (
    <div>
      {/* Header & Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Requests & Reservations</h1>
          <p className="page-subtitle">Manage asset borrowing approval queues, reservations, and handoffs</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', backgroundColor: 'var(--surface-container)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'Pending', label: `Pending (${pendingCount})` },
              { id: 'Approved', label: `Approved (${approvedCount})` },
              { id: 'All', label: 'All Requests' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="btn"
                style={{
                  backgroundColor: activeTab === tab.id ? 'var(--surface-lowest)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button onClick={() => navigate('/request')} className="btn btn-primary">
            <Plus size={16} /> New Request
          </button>
        </div>
      </div>

      {actionError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{actionError}</div>}

      {/* Requests Container */}
      <div className="card-level-1" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-state">Loading reservation queue...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <FileCheck size={42} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
            <strong>No {activeTab.toLowerCase()} requests</strong>
            <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
              Borrowers can submit borrowing requests using the Resource Request form.
            </p>
            <button onClick={() => navigate('/request')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <Plus size={16} /> Submit Reservation Request
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map(item => (
              <div 
                key={item.id} 
                style={{ 
                  padding: '1.25rem', 
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className={`badge ${statusBadge(item.status)}`}>{item.status}</span>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {item.id.slice(0, 8)}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                      {item.assetName || (item.asset && item.asset.name) || 'Requested Asset'}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Requested by <strong>{item.userName || item.userId}</strong>
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <div>From: <strong>{fmtDateTime(item.startDate)}</strong></div>
                    <div>Until: <strong>{fmtDateTime(item.endDate)}</strong></div>
                  </div>
                </div>

                {item.purpose && (
                  <div style={{ background: 'var(--surface-low)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} color="var(--color-primary)" />
                    <span>Purpose: {item.purpose}</span>
                  </div>
                )}

                {item.status === 'Rejected' && item.rejectionReason && (
                  <div style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '0.5rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                    Rejection note: {item.rejectionReason}
                  </div>
                )}

                {/* Approver / Logistics actions */}
                {item.status === 'Pending' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    <button onClick={() => handleApprove(item.id)} className="btn btn-success btn-sm">
                      <Check size={14} /> Approve Request
                    </button>
                    <button onClick={() => handleReject(item.id)} className="btn btn-danger btn-sm">
                      <X size={14} /> Reject Request
                    </button>
                    <input 
                      type="text" 
                      placeholder="Optional reason for rejection..."
                      value={rejectReason[item.id] || ''}
                      onChange={e => setRejectReason({ ...rejectReason, [item.id]: e.target.value })}
                      className="form-control"
                      style={{ flex: 1, minWidth: '200px', padding: '0.35rem 0.65rem', fontSize: '0.82rem' }}
                    />
                  </div>
                )}

                {item.status === 'Approved' && (
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button 
                      onClick={() => navigate(`/qr-scan?assetId=${item.assetId}`)} 
                      className="btn btn-primary btn-sm"
                    >
                      <ArrowRightLeft size={14} /> Release Asset Now (Handoff)
                    </button>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>
                      Approved and reserved. Ready for handoff checkout.
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsPage;
