import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  QrCode, 
  Eye, 
  History, 
  Printer, 
  RotateCcw, 
  X, 
  MapPin, 
  BatteryCharging 
} from 'lucide-react';
import { MOCK_ASSETS } from '../services/api';

const InventoryPage = () => {
  const [assets, setAssets] = useState([
    {
      id: 'AST-8924',
      name: 'Forklift TX-500',
      category: 'Heavy Machinery',
      location: 'Warehouse A, Sec 4',
      status: 'In Use',
      holder: 'Marcus Chen',
      holderRole: 'Logistics Operative',
      checkedOut: 'Oct 12, 08:30 AM',
      condition: 'Good',
      battery: 75,
      serviceDue: 'In 14 days',
      locationBay: 'Warehouse A, Sector 4, Bay 12',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'AST-9011',
      name: 'Diagnostic Tablet Pro',
      category: 'IT Equipment',
      location: 'Tech Bay 2',
      status: 'Available',
      holder: 'None',
      holderRole: '-',
      checkedOut: '-',
      condition: 'Excellent',
      battery: 100,
      serviceDue: 'In 45 days',
      locationBay: 'Tech Bay 2, Cabinet B',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'AST-7732',
      name: 'Delivery Van Transit',
      category: 'Vehicles',
      location: 'Loading Dock B',
      status: 'Maintenance',
      holder: 'Service Dept',
      holderRole: 'Maintenance',
      checkedOut: 'Oct 10, 14:00 PM',
      condition: 'Service Required',
      battery: 40,
      serviceDue: 'Today',
      locationBay: 'Service Bay 1',
      image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'AST-9104',
      name: 'Pallet Jack Manual',
      category: 'Tools',
      location: 'Warehouse A, Sec 1',
      status: 'Available',
      holder: 'None',
      holderRole: '-',
      checkedOut: '-',
      condition: 'Good',
      battery: 100,
      serviceDue: 'In 60 days',
      locationBay: 'Warehouse A, Sector 1',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80'
    }
  ]);

  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.id.toLowerCase().includes(search.toLowerCase()) || 
                          a.name.toLowerCase().includes(search.toLowerCase()) ||
                          a.holder.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || a.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Available': return 'badge-success';
      case 'In Use': return 'badge-info';
      case 'Maintenance': return 'badge-warning';
      default: return 'badge-error';
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1.25rem', height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
      
      {/* Left Data Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
        
        {/* Filters Bar */}
        <div className="card-level-1" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Search Assets</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="ID, Name, or Holder"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ width: '180px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Category</label>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="search-input"
            >
              <option value="All">All Categories</option>
              <option value="Heavy Machinery">Heavy Machinery</option>
              <option value="Vehicles">Vehicles</option>
              <option value="IT Equipment">IT Equipment</option>
              <option value="Tools">Tools</option>
            </select>
          </div>

          <div style={{ width: '180px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="search-input"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <button className="btn btn-secondary">
            <Filter size={16} /> More Filters
          </button>
        </div>

        {/* Data Table */}
        <div className="card-level-1" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ASSET ID</th>
                  <th>NAME</th>
                  <th>CATEGORY</th>
                  <th>LOCATION</th>
                  <th>STATUS</th>
                  <th>CURRENT HOLDER</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map(asset => (
                  <tr 
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    style={{ 
                      cursor: 'pointer',
                      borderLeft: selectedAsset?.id === asset.id ? '3px solid var(--color-primary)' : '3px solid transparent',
                      backgroundColor: selectedAsset?.id === asset.id ? 'var(--surface-low)' : 'transparent'
                    }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary)' }}>
                        <QrCode size={14} /> {asset.id}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{asset.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{asset.category}</td>
                    <td>{asset.location}</td>
                    <td><span className={`badge ${getStatusBadgeClass(asset.status)}`}>{asset.status}</span></td>
                    <td>{asset.holder}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                        <button className="icon-btn" title="View Profile"><Eye size={16} /></button>
                        <button className="icon-btn" title="History"><History size={16} /></button>
                        <button className="icon-btn" title="Check-in"><RotateCcw size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Showing {filteredAssets.length} of 1,248 assets</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>Prev</button>
              <button className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>Next</button>
            </div>
          </div>
        </div>

      </div>

      {/* Right Detail Sidebar Drawer */}
      {selectedAsset && (
        <aside style={{ width: '340px', backgroundColor: 'var(--surface-lowest)', borderLeft: '1px solid var(--border-color)', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '1.25rem', gap: '1rem', borderRadius: '8px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem' }}>{selectedAsset.id}</span>
                <span className={`badge ${getStatusBadgeClass(selectedAsset.status)}`}>{selectedAsset.status}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedAsset.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedAsset.category}</p>
            </div>
            <button onClick={() => setSelectedAsset(null)} className="icon-btn"><X size={18} /></button>
          </div>

          {/* Asset Image Box */}
          <div style={{ height: '180px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
            <img src={selectedAsset.image} alt={selectedAsset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <span style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              Updated 2d ago
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }}><Printer size={14} /> Print Tag</button>
            <button className="btn btn-primary" style={{ flex: 1 }}><RotateCcw size={14} /> Return</button>
          </div>

          {/* Current Assignment */}
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--surface-low)', borderRadius: '6px' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>CURRENT ASSIGNMENT</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                {selectedAsset.holder.charAt(0)}
              </div>
              <div>
                <strong style={{ fontSize: '0.88rem', display: 'block' }}>{selectedAsset.holder}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedAsset.holderRole}</span>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Checked out: {selectedAsset.checkedOut}
            </p>
          </div>

          {/* Health & Maintenance */}
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--surface-low)', borderRadius: '6px' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>HEALTH & MAINTENANCE</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span>Condition</span>
              <strong style={{ color: 'var(--color-secondary)' }}>● {selectedAsset.condition}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span>Battery Life</span>
              <strong>{selectedAsset.battery}%</strong>
            </div>
            <div style={{ background: 'var(--border-color)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${selectedAsset.battery}%`, background: 'var(--color-secondary)', height: '100%' }}></div>
            </div>
          </div>

          {/* Location Bay */}
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--surface-low)', borderRadius: '6px' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>LAST KNOWN LOCATION</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <MapPin size={16} color="var(--color-primary)" />
              <span>{selectedAsset.locationBay}</span>
            </div>
          </div>

        </aside>
      )}

    </div>
  );
};

export default InventoryPage;
