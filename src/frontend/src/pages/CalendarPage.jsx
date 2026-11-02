import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Package } from 'lucide-react';
import { apiService } from '../services/api';
import { fmtDate, statusBadge } from '../utils/format';

const CalendarPage = () => {
  const [reservations, setReservations] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.getReservations().catch(() => []),
      apiService.getAssets().catch(() => [])
    ]).then(([r, a]) => {
      setReservations(Array.isArray(r) ? r : []);
      setAssets(Array.isArray(a) ? a : []);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Resource Reservation Calendar</h1>
          <p className="page-subtitle">Visual timetable of asset bookings, scheduled borrowing windows, and availability</p>
        </div>
      </div>

      {/* Reservation Calendar List Grid */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="glass-card">
          <div className="glass-card-header">
            <h3 className="glass-card-title">Scheduled Asset Bookings</h3>
            <CalendarIcon size={18} color="var(--color-primary)" />
          </div>
          {loading ? (
            <div className="loading-state">Loading bookings...</div>
          ) : reservations.length === 0 ? (
            <div className="empty-state">
              <CalendarIcon size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
              <p style={{ fontSize: '0.85rem' }}>No asset bookings or reservations scheduled.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {reservations.map(res => (
                <div 
                  key={res.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0.85rem 1rem', 
                    background: 'var(--surface-low)', 
                    borderRadius: '8px'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{res.assetName}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Requester: <strong>{res.userName || res.userId}</strong>
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      {fmtDate(res.startDate)} – {fmtDate(res.endDate)}
                    </span>
                  </div>
                  <span className={`badge ${statusBadge(res.status)}`}>{res.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resource Availability Matrix */}
        <div className="glass-card">
          <div className="glass-card-header">
            <h3 className="glass-card-title">Live Asset Availability Matrix</h3>
            <Package size={18} color="var(--color-secondary)" />
          </div>
          {loading ? (
            <div className="loading-state">Loading assets...</div>
          ) : assets.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: '0.85rem' }}>No assets cataloged in the system yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
              {assets.map(asset => (
                <div key={asset.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>{asset.name}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{asset.location}</span>
                  </div>
                  <span className={`badge ${statusBadge(asset.status)}`}>{asset.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
