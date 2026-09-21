import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bookmark, Clock, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

const CalendarPage = () => {
  const [reservations, setReservations] = useState([]);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    Promise.all([apiService.getReservations(), apiService.getAssets()]).then(([r, a]) => {
      setReservations(r);
      setAssets(a);
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Resource Reservation Calendar</h1>
          <p className="page-subtitle">Visual timetable of asset bookings, current borrowings, and scheduling windows</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm"><ChevronLeft size={16} /></button>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>September 2026</span>
          <button className="btn btn-secondary btn-sm"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Reservation Calendar List Grid */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="glass-card">
          <div className="glass-card-header">
            <h3 className="glass-card-title">Scheduled Asset Bookings</h3>
            <CalendarIcon size={18} color="#a5b4fc" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reservations.map(res => (
              <div 
                key={res.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '0.85rem 1rem', 
                  background: 'rgba(255,255,255,0.02)', 
                  borderRadius: '10px',
                  borderLeft: `4px solid ${res.status === 'Approved' ? '#10b981' : res.status === 'Pending' ? '#f59e0b' : '#ef4444'}`
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{res.assetName}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Requester: <strong>{res.userName}</strong>
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                    {new Date(res.startDate).toLocaleDateString()} - {new Date(res.endDate).toLocaleDateString()}
                  </span>
                </div>
                <span className={`badge badge-${res.status.toLowerCase()}`}>{res.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Availability Matrix */}
        <div className="glass-card">
          <div className="glass-card-header">
            <h3 className="glass-card-title">Asset Availability Status</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {assets.map(asset => (
              <div key={asset.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{asset.name}</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{asset.location}</span>
                </div>
                <span className={`badge badge-${asset.status.toLowerCase()}`}>{asset.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
