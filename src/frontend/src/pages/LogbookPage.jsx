import React from 'react';
import { 
  Download, 
  Calendar, 
  Filter, 
  User, 
  Repeat, 
  ShieldCheck, 
  AlertTriangle, 
  QrCode, 
  Edit3, 
  ChevronRight,
  Laptop,
  Home,
  Wrench
} from 'lucide-react';

const LogbookPage = () => {
  return (
    <div>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Digital Logbook</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Real-time timeline of asset movement and digital authorization.
          </p>
        </div>
        <button className="btn btn-secondary">
          <Download size={16} /> Export Log
        </button>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem' }}>
        
        {/* Left Timeline Section (8 cols) */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Filters Bar */}
          <div className="card-level-1" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem', color: 'var(--text-muted)' }}>Date</label>
              <input type="date" defaultValue="2026-09-20" className="search-input" style={{ width: '100%' }} />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem', color: 'var(--text-muted)' }}>Category</label>
              <select className="search-input" style={{ width: '100%' }}>
                <option>All Assets</option>
                <option>Heavy Machinery</option>
                <option>IT Equipment</option>
                <option>Vehicles</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem', color: 'var(--text-muted)' }}>User</label>
              <input type="text" placeholder="Filter by name..." className="search-input" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Timeline Feed Container */}
          <div className="card-level-1">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem' }}>Today's Handoff Timeline</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Event 1 */}
              <div style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--surface-low)', display: 'flex', gap: '1rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: '50%', background: 'var(--surface-container)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Laptop size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>10:45 AM</span>
                      <span className="badge badge-info">Check Out</span>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                      <QrCode size={12} /> QR Scanned
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    <strong>John Doe</strong> checked out <strong>Laptop #402</strong>.
                  </p>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}># IT-402</span>
                </div>
              </div>

              {/* Event 2 */}
              <div style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--surface-low)', display: 'flex', gap: '1rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: '50%', background: 'var(--surface-container)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Home size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>09:15 AM</span>
                      <span className="badge badge-warning">Reservation</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    <strong>Meeting Room B</strong> reserved by <strong>Marketing Team</strong>.
                  </p>
                </div>
              </div>

              {/* Event 3 */}
              <div style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--surface-low)', display: 'flex', gap: '1rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: '50%', background: 'var(--surface-container)', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wrench size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>08:30 AM</span>
                      <span className="badge badge-warning">Maintenance</span>
                    </div>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      <ShieldCheck size={12} /> E-Signed
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    <strong>Truck #12</strong> returned from maintenance. Logged by <strong>Mike Smith</strong>.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Widgets Section (4 cols) */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Top 2 KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="card-level-1">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Total Movements</span>
              <strong style={{ fontSize: '1.6rem', fontWeight: 800 }}>142</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-secondary)', display: 'block', marginTop: '0.2rem' }}>+12% vs yesterday</span>
            </div>

            <div className="card-level-1">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Authentications</span>
              <strong style={{ fontSize: '1.6rem', fontWeight: 800 }}>98</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>68 QR / 30 Sign</span>
            </div>
          </div>

          {/* Exceptions Alert Card */}
          <div className="card-level-1" style={{ backgroundColor: 'var(--color-error-bg)', borderColor: 'var(--color-error)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-error)', fontWeight: 800, marginBottom: '0.75rem' }}>
              <AlertTriangle size={18} />
              <span>Exceptions (2)</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.6rem', background: 'var(--surface-lowest)', borderRadius: '6px', borderLeft: '3px solid var(--color-error)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-error)' }}>
                  <span>Overdue Return</span>
                  <span>3h late</span>
                </div>
                <p style={{ fontSize: '0.8rem', marginTop: '2px' }}>Projector A1 (Sarah Connor)</p>
              </div>

              <div style={{ padding: '0.6rem', background: 'var(--surface-lowest)', borderRadius: '6px', borderLeft: '3px solid var(--color-error)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-error)' }}>
                  <span>Auth Failed</span>
                  <span>10m ago</span>
                </div>
                <p style={{ fontSize: '0.8rem', marginTop: '2px' }}>Gate 4 Access Denied</p>
              </div>
            </div>
          </div>

          {/* Quick Log Action Buttons */}
          <div className="card-level-1">
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>QUICK LOG</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <QrCode size={16} color="var(--color-secondary)" />
                  <span>Scan Asset</span>
                </div>
                <ChevronRight size={16} />
              </button>

              <button className="btn btn-secondary" style={{ justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Edit3 size={16} color="var(--color-primary)" />
                  <span>Manual Entry</span>
                </div>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LogbookPage;
