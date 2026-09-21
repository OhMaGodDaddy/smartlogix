import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  CheckCircle, 
  Repeat, 
  AlertTriangle, 
  Wrench, 
  QrCode, 
  Plus, 
  MoreVertical,
  Truck,
  Forklift
} from 'lucide-react';

const DashboardOverviewPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Action Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Dashboard Overview</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Real-time status of all managed logistics assets.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/qr-scan')} className="btn btn-secondary">
            <QrCode size={16} /> Scan QR
          </button>
          <button onClick={() => navigate('/inventory')} className="btn btn-primary">
            <Plus size={16} /> New Asset
          </button>
        </div>
      </div>

      {/* 5 Metrics Grid */}
      <div className="metrics-grid-5">
        <div className="card-level-1">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>TOTAL ASSETS</span>
            <Layers size={18} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>1,240</div>
        </div>

        <div className="card-level-1">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-secondary)' }}>AVAILABLE</span>
            <CheckCircle size={18} color="var(--color-secondary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>850</div>
        </div>

        <div className="card-level-1">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>BORROWED</span>
            <Repeat size={18} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>320</div>
        </div>

        <div className="card-level-1" style={{ border: '1px solid var(--color-error)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-error)' }}>OVERDUE</span>
            <AlertTriangle size={18} color="var(--color-error)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-error)' }}>45</div>
        </div>

        <div className="card-level-1">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>MAINTENANCE</span>
            <Wrench size={18} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>25</div>
        </div>
      </div>

      {/* Main Charts & Tables Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        
        {/* Left Column (8 cols): Utilization Chart & Recent Transactions */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Utilization Trend Line Chart */}
          <div className="card-level-1" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Asset Utilization Trend</h3>
              <button className="icon-btn"><MoreVertical size={16} /></button>
            </div>
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              <svg className="w-full h-full" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,80 Q10,70 20,75 T40,50 T60,60 T80,30 T100,20" fill="none" stroke="var(--color-primary)" strokeWidth="3" />
                <path d="M0,80 Q10,70 20,75 T40,50 T60,60 T80,30 T100,20 L100,100 L0,100 Z" fill="var(--color-primary)" fillOpacity="0.08" />
                <path d="M0,60 Q15,65 30,55 T50,45 T75,55 T100,40" fill="none" stroke="var(--color-secondary)" strokeDasharray="4,4" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="card-level-1" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Transactions</h3>
              <button onClick={() => navigate('/logbook')} className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                View All
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ASSET ID</th>
                  <th>TYPE</th>
                  <th>ACTION</th>
                  <th>USER</th>
                  <th>TIME</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>AST-4928</td>
                  <td>Pallet Jack</td>
                  <td><span className="badge badge-error">Check-out</span></td>
                  <td>J. Smith</td>
                  <td style={{ color: 'var(--text-muted)' }}>10 mins ago</td>
                </tr>
                <tr>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>VEH-104</td>
                  <td>Delivery Van</td>
                  <td><span className="badge badge-success">Check-in</span></td>
                  <td>A. Davis</td>
                  <td style={{ color: 'var(--text-muted)' }}>45 mins ago</td>
                </tr>
                <tr>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>AST-3811</td>
                  <td>Forklift</td>
                  <td><span className="badge badge-warning">Maintenance</span></td>
                  <td>M. Wong</td>
                  <td style={{ color: 'var(--text-muted)' }}>2 hrs ago</td>
                </tr>
                <tr>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>AST-9920</td>
                  <td>Scanner</td>
                  <td><span className="badge badge-error">Check-out</span></td>
                  <td>L. Chen</td>
                  <td style={{ color: 'var(--text-muted)' }}>3 hrs ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 cols): Donut Chart, Upcoming Returns, Vehicle Snapshot */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Category Distribution Donut */}
          <div className="card-level-1">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Category Distribution</h3>
            <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <svg style={{ width: '130px', height: '130px' }} viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--surface-container)" strokeWidth="4" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-primary)" strokeDasharray="45, 100" strokeWidth="4" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-secondary)" strokeDasharray="30, 100" strokeDashoffset="-45" strokeWidth="4" />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Total</span>
                <strong style={{ fontSize: '1.1rem' }}>1.2k</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>● Heavy (45%)</span>
              <span>● Vehicles (30%)</span>
              <span>● Tech (25%)</span>
            </div>
          </div>

          {/* Upcoming Returns */}
          <div className="card-level-1">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Upcoming Returns</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.4rem', borderRadius: '6px', background: 'var(--surface-container)' }}>
                  <Forklift size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.85rem', display: 'block' }}>AST-302 (Forklift)</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due: Today, 14:00</span>
                </div>
                <span className="badge badge-error">Overdue</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.4rem', borderRadius: '6px', background: 'var(--surface-container)' }}>
                  <Truck size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.85rem', display: 'block' }}>VEH-991 (Truck)</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due: Tomorrow, 09:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Schedule Snapshot */}
          <div className="card-level-1">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Vehicle Schedule Snapshot</h3>
            <div style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', display: 'block' }}>Route A Dispatch</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>08:00 AM • 3 Vehicles</span>
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', display: 'block' }}>Maintenance Slot</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>11:30 AM • VEH-104</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardOverviewPage;
