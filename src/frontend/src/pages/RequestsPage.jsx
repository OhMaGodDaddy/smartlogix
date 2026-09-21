import React, { useState } from 'react';
import { 
  FileCheck, 
  Check, 
  X, 
  Edit3, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Video, 
  Truck 
} from 'lucide-react';

const RequestsPage = () => {
  const [activeTab, setActiveTab] = useState('Pending Approval');

  return (
    <div>
      {/* Header & Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Requests & Reservations</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Manage borrowing workflows and asset scheduling.
          </p>
        </div>

        {/* Status Tabs */}
        <div style={{ display: 'flex', backgroundColor: 'var(--surface-container)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          {['Pending Approval', 'Confirmed', 'Active Loans'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="btn"
              style={{
                backgroundColor: activeTab === tab ? 'var(--surface-lowest)' : 'transparent',
                color: activeTab === tab ? 'var(--text-main)' : 'var(--text-muted)',
                fontSize: '0.8rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem' }}>
        
        {/* Left Column (5 cols): Request Cards List */}
        <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Card 1: Dr. Sarah Jenkins */}
          <div className="card-level-1" style={{ borderLeft: '4px solid var(--color-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80" 
                alt="Sarah Jenkins" 
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Dr. Sarah Jenkins</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Field Research Div.</span>
              </div>
              <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>URGENT</span>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-low)', borderRadius: '6px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                <Video size={16} color="var(--color-primary)" />
                <span>Red Komodo 6K Cinema Camera</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div>
                  <span style={{ display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>DURATION</span>
                  <span style={{ color: 'var(--text-main)' }}>Oct 12 - Oct 15 (3 Days)</span>
                </div>
                <div>
                  <span style={{ display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>PURPOSE</span>
                  <span style={{ color: 'var(--text-main)' }}>Site Survey Documentat...</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}>
                <Edit3 size={14} /> Modify
              </button>
              <button className="btn btn-secondary" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)', flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}>
                <X size={14} /> Deny
              </button>
              <button className="btn btn-primary" style={{ backgroundColor: '#000000', color: '#ffffff', flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}>
                <Check size={14} /> Approve
              </button>
            </div>
          </div>

          {/* Card 2: Marcus Chen */}
          <div className="card-level-1">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: 700 }}>
                MC
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Marcus Chen</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logistics Support</span>
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-low)', borderRadius: '6px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                <Truck size={16} color="var(--color-primary)" />
                <span>Ford Transit Van (V-204)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div>
                  <span style={{ display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>DURATION</span>
                  <span style={{ color: 'var(--text-main)' }}>Oct 14, 08:00 - 17:00</span>
                </div>
                <div>
                  <span style={{ display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>PURPOSE</span>
                  <span style={{ color: 'var(--text-main)' }}>Equipment Transport to...</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}>
                <Edit3 size={14} /> Modify
              </button>
              <button className="btn btn-secondary" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)', flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}>
                <X size={14} /> Deny
              </button>
              <button className="btn btn-primary" style={{ backgroundColor: '#000000', color: '#ffffff', flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}>
                <Check size={14} /> Approve
              </button>
            </div>
          </div>

        </div>

        {/* Right Column (7 cols): Asset Availability Radar */}
        <div style={{ gridColumn: 'span 7' }}>
          <div className="card-level-1" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Asset Availability Radar</h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 700 }}>
                <button className="icon-btn"><ChevronLeft size={16} /></button>
                <span>Oct 12 - Oct 18</span>
                <button className="icon-btn"><ChevronRight size={16} /></button>
              </div>
            </div>

            {/* Timetable Grid */}
            <div className="data-table-container" style={{ flex: 1 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ASSET</th>
                    <th>Mon 12</th>
                    <th>Tue 13</th>
                    <th>Wed 14</th>
                    <th>Thu 15</th>
                    <th>Fri 16</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Red Komodo 6K</td>
                    <td colSpan="4" style={{ padding: '0.4rem' }}>
                      <div style={{ background: 'var(--surface-container)', color: 'var(--text-main)', fontSize: '0.7rem', padding: '0.3rem', borderRadius: '4px', textAlign: 'center', fontWeight: 600 }}>
                        PENDING (Dr. Jenkins)
                      </div>
                    </td>
                    <td>-</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Ford Transit (V-204)</td>
                    <td>-</td>
                    <td>-</td>
                    <td style={{ padding: '0.4rem' }}>
                      <div style={{ background: 'var(--surface-high)', fontSize: '0.65rem', padding: '0.2rem', borderRadius: '4px', textAlign: 'center' }}>
                        PENDING
                      </div>
                    </td>
                    <td colSpan="2" style={{ padding: '0.4rem' }}>
                      <div style={{ background: 'var(--surface-highest)', fontSize: '0.65rem', padding: '0.2rem', borderRadius: '4px', textAlign: 'center' }}>
                        CONFIRMED (Maint.)
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default RequestsPage;
