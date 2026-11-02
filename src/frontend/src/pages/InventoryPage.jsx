import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  QrCode, 
  RotateCcw, 
  X, 
  MapPin, 
  Plus,
  Trash2,
  Printer,
  Clock,
  ArrowRightLeft,
  Package
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { apiService } from '../services/api';
import { statusBadge, fmtDate, ASSET_CONDITIONS } from '../utils/format';
import { useAuth } from '../context/AuthContext';

const InventoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: 'IT Equipment',
    location: '',
    description: '',
    condition: 'Good',
    acquisitionCost: '',
    acquisitionDate: ''
  });

  const [checkoutData, setCheckoutData] = useState({
    borrowerName: '',
    expectedReturnDate: ''
  });

  const [returnCondition, setReturnCondition] = useState('Good');

  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAssets();
      const list = Array.isArray(data) ? data : [];
      setAssets(list);
      if (selectedAsset) {
        const refreshed = list.find(a => a.id === selectedAsset.id);
        setSelectedAsset(refreshed || (list.length > 0 ? list[0] : null));
      } else if (list.length > 0) {
        setSelectedAsset(list[0]);
      } else {
        setSelectedAsset(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  // Open modal if url has ?action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsNewModalOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  // Categories list
  const existingCategories = Array.from(new Set(assets.map(a => a.category).filter(Boolean)));
  const defaultCategories = ['Heavy Machinery', 'Vehicles', 'IT Equipment', 'AV Equipment', 'Audio', 'Engineering Tools', 'Photography'];
  const allCategories = Array.from(new Set([...defaultCategories, ...existingCategories]));

  const filteredAssets = assets.filter(a => {
    const term = search.toLowerCase();
    const matchesSearch = (a.assetTag || '').toLowerCase().includes(term) ||
                          (a.name || '').toLowerCase().includes(term) ||
                          (a.category || '').toLowerCase().includes(term) ||
                          (a.location || '').toLowerCase().includes(term) ||
                          (a.currentHolderName || '').toLowerCase().includes(term);
    const matchesCategory = categoryFilter === 'All' || a.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    setModalSubmitting(true);
    setModalError('');
    try {
      const created = await apiService.createAsset({
        ...formData,
        acquisitionCost: formData.acquisitionCost ? parseFloat(formData.acquisitionCost) : null,
        acquisitionDate: formData.acquisitionDate || null
      });
      setIsNewModalOpen(false);
      setFormData({
        name: '',
        category: 'IT Equipment',
        location: '',
        description: '',
        condition: 'Good',
        acquisitionCost: '',
        acquisitionDate: ''
      });
      await loadAssets();
      setSelectedAsset(created);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setModalSubmitting(true);
    setModalError('');
    try {
      await apiService.checkoutAsset(selectedAsset.id, {
        borrowerName: checkoutData.borrowerName,
        expectedReturnDate: new Date(checkoutData.expectedReturnDate).toISOString(),
        releasedBy: user?.id,
        releasedByName: user?.name,
        conditionAtRelease: selectedAsset.condition
      });
      setIsCheckoutModalOpen(false);
      setCheckoutData({ borrowerName: '', expectedReturnDate: '' });
      await loadAssets();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setModalSubmitting(true);
    setModalError('');
    try {
      await apiService.returnAsset(selectedAsset.id, {
        conditionAtReturn: returnCondition
      });
      setIsReturnModalOpen(false);
      await loadAssets();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDelete = async (asset) => {
    if (!window.confirm(`Are you sure you want to delete asset "${asset.name}" (${asset.assetTag})?`)) return;
    try {
      await apiService.deleteAsset(asset.id);
      await loadAssets();
    } catch (err) {
      alert(`Cannot delete asset: ${err.message}`);
    }
  };

  const handlePrintTag = (asset) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>SmartLogix Tag - ${asset.assetTag}</title>
          <style>
            body { font-family: monospace; text-align: center; padding: 30px; }
            .box { border: 2px dashed #000; padding: 20px; display: inline-block; border-radius: 8px; }
            h2 { margin: 5px 0; font-size: 20px; }
            p { margin: 4px 0; color: #555; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>SMARTLOGIX ASSET</h2>
            <p><strong>${asset.assetTag}</strong></p>
            <p>${asset.name}</p>
            <p>Location: ${asset.location}</p>
            <p style="margin-top: 15px; font-size: 11px;">Scan with SmartLogix QR Reader</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ display: 'flex', gap: '1.25rem', height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
      
      {/* Left Data Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
        
        {/* Filters & Action Bar */}
        <div className="card-level-1" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Search Assets</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Tag, Name, Category, or Holder"
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
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
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
              <option value="Borrowed">Borrowed</option>
              <option value="Reserved">Reserved</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>

          <button onClick={() => setIsNewModalOpen(true)} className="btn btn-primary">
            <Plus size={16} /> New Asset
          </button>
        </div>

        {/* Assets Table Container */}
        <div className="card-level-1" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          {loading ? (
            <div className="loading-state">
              <Clock size={24} style={{ margin: '0 auto 0.5rem auto', opacity: 0.6 }} />
              <p>Connecting to SmartLogix Inventory database...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <p style={{ color: 'var(--color-error)', fontWeight: 600 }}>{error}</p>
              <button onClick={loadAssets} className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>Retry</button>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="empty-state">
              <Package size={42} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
              <strong>No assets found</strong>
              <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                {assets.length === 0 ? "Your inventory is currently empty. Start cataloging equipment by adding your first asset." : "No assets match your search or filter criteria."}
              </p>
              {assets.length === 0 && (
                <button onClick={() => setIsNewModalOpen(true)} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  <Plus size={16} /> Add First Asset
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto', flex: 1 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ASSET TAG</th>
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
                          <QrCode size={14} /> {asset.assetTag}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{asset.name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{asset.category}</td>
                      <td>{asset.location}</td>
                      <td><span className={`badge ${statusBadge(asset.status)}`}>{asset.status}</span></td>
                      <td>{asset.currentHolderName || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                          <button 
                            className="icon-btn" 
                            title="Print Label"
                            onClick={(e) => { e.stopPropagation(); handlePrintTag(asset); }}
                          >
                            <Printer size={15} />
                          </button>
                          <button 
                            className="icon-btn" 
                            title="Delete"
                            onClick={(e) => { e.stopPropagation(); handleDelete(asset); }}
                          >
                            <Trash2 size={15} color="var(--color-error)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Showing {filteredAssets.length} of {assets.length} assets</span>
            <button onClick={loadAssets} className="btn btn-secondary btn-sm">Refresh List</button>
          </div>
        </div>

      </div>

      {/* Right Detail Sidebar Drawer */}
      {selectedAsset && (
        <aside style={{ width: '360px', backgroundColor: 'var(--surface-lowest)', borderLeft: '1px solid var(--border-color)', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '1.25rem', gap: '1rem', borderRadius: '8px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem' }}>{selectedAsset.assetTag}</span>
                <span className={`badge ${statusBadge(selectedAsset.status)}`}>{selectedAsset.status}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedAsset.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedAsset.category}</p>
            </div>
            <button onClick={() => setSelectedAsset(null)} className="icon-btn"><X size={18} /></button>
          </div>

          {/* QR Code Identification Card */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--surface-low)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', marginBottom: '0.75rem' }}>
              <QRCodeSVG value={selectedAsset.qrCodeRef || selectedAsset.assetTag} size={130} />
            </div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
              Ref: {selectedAsset.qrCodeRef || selectedAsset.assetTag}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.75rem' }}>
              <button onClick={() => handlePrintTag(selectedAsset)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                <Printer size={14} /> Print Tag
              </button>
            </div>
          </div>

          {/* Checkout & Return Actions */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {selectedAsset.status === 'Available' && (
              <button onClick={() => setIsCheckoutModalOpen(true)} className="btn btn-primary" style={{ flex: 1 }}>
                <ArrowRightLeft size={15} /> Check Out (Borrow)
              </button>
            )}
            {selectedAsset.status === 'Borrowed' && (
              <button onClick={() => setIsReturnModalOpen(true)} className="btn btn-success" style={{ flex: 1 }}>
                <RotateCcw size={15} /> Return Asset
              </button>
            )}
          </div>

          {/* Description */}
          {selectedAsset.description && (
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--surface-low)', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>DESCRIPTION</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{selectedAsset.description}</p>
            </div>
          )}

          {/* Current Assignment */}
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--surface-low)', borderRadius: '6px' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>CURRENT ASSIGNMENT</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                {selectedAsset.currentHolderName ? selectedAsset.currentHolderName.charAt(0) : '—'}
              </div>
              <div>
                <strong style={{ fontSize: '0.88rem', display: 'block' }}>{selectedAsset.currentHolderName || 'In Property Vault'}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {selectedAsset.status}</span>
              </div>
            </div>
          </div>

          {/* Condition & Logistics Info */}
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--surface-low)', borderRadius: '6px' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>LOGISTICS & CONDITION</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span>Condition</span>
              <strong style={{ color: 'var(--color-secondary)' }}>● {selectedAsset.condition || 'Good'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span>Acquisition Date</span>
              <strong>{fmtDate(selectedAsset.acquisitionDate)}</strong>
            </div>
            {selectedAsset.acquisitionCost && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span>Acquisition Cost</span>
                <strong>${parseFloat(selectedAsset.acquisitionCost).toLocaleString()}</strong>
              </div>
            )}
          </div>

          {/* Location */}
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--surface-low)', borderRadius: '6px' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>LOCATION</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <MapPin size={16} color="var(--color-primary)" />
              <span>{selectedAsset.location}</span>
            </div>
          </div>

        </aside>
      )}

      {/* CREATE NEW ASSET MODAL */}
      {isNewModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Register New Asset</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="icon-btn"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateAsset}>
              <div className="modal-body">
                {modalError && <div className="alert alert-error">{modalError}</div>}

                <div className="form-group">
                  <label className="form-label">Asset Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Dell Precision 7550 Workstation"
                    className="form-control"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <input 
                      type="text" 
                      required 
                      list="categories-list"
                      placeholder="e.g. IT Equipment"
                      className="form-control"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                    />
                    <datalist id="categories-list">
                      {allCategories.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Vault / Location *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Lab 201, Shelf B"
                      className="form-control"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Specifications</label>
                  <textarea 
                    rows="3" 
                    placeholder="Model numbers, accessories, serial or tracking notes..."
                    className="form-control"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Condition</label>
                    <select 
                      className="form-control"
                      value={formData.condition}
                      onChange={e => setFormData({ ...formData, condition: e.target.value })}
                    >
                      {ASSET_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Acquisition Cost (USD)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00"
                      className="form-control"
                      value={formData.acquisitionCost}
                      onChange={e => setFormData({ ...formData, acquisitionCost: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Acquisition Date</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={formData.acquisitionDate}
                    onChange={e => setFormData({ ...formData, acquisitionDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsNewModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={modalSubmitting} className="btn btn-primary">
                  {modalSubmitting ? 'Saving...' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {isCheckoutModalOpen && selectedAsset && (
        <div className="modal-overlay" onClick={() => setIsCheckoutModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Release Asset (Check Out)</h3>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="icon-btn"><X size={18} /></button>
            </div>
            <form onSubmit={handleCheckout}>
              <div className="modal-body">
                {modalError && <div className="alert alert-error">{modalError}</div>}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Releasing <strong>{selectedAsset.name}</strong> ({selectedAsset.assetTag}) to an authorized borrower.
                </p>

                <div className="form-group">
                  <label className="form-label">Borrower Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. John Doe"
                    className="form-control"
                    value={checkoutData.borrowerName}
                    onChange={e => setCheckoutData({ ...checkoutData, borrowerName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expected Return Date & Time *</label>
                  <input 
                    type="datetime-local" 
                    required 
                    className="form-control"
                    value={checkoutData.expectedReturnDate}
                    onChange={e => setCheckoutData({ ...checkoutData, expectedReturnDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsCheckoutModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={modalSubmitting} className="btn btn-primary">
                  {modalSubmitting ? 'Processing...' : 'Confirm Release'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN MODAL */}
      {isReturnModalOpen && selectedAsset && (
        <div className="modal-overlay" onClick={() => setIsReturnModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Asset Return</h3>
              <button onClick={() => setIsReturnModalOpen(false)} className="icon-btn"><X size={18} /></button>
            </div>
            <form onSubmit={handleReturn}>
              <div className="modal-body">
                {modalError && <div className="alert alert-error">{modalError}</div>}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Checking in <strong>{selectedAsset.name}</strong> ({selectedAsset.assetTag}) from {selectedAsset.currentHolderName || 'borrower'}.
                </p>

                <div className="form-group">
                  <label className="form-label">Condition at Return</label>
                  <select 
                    className="form-control"
                    value={returnCondition}
                    onChange={e => setReturnCondition(e.target.value)}
                  >
                    {ASSET_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="form-hint">Selecting "Requires Repair" will automatically route this asset to Maintenance status.</span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsReturnModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={modalSubmitting} className="btn btn-success">
                  {modalSubmitting ? 'Recording...' : 'Complete Check-In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InventoryPage;
