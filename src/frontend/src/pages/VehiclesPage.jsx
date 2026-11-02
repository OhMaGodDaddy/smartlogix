import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Trash2, 
  X,
  CheckCircle2,
  Navigation,
  Wrench,
  AlertTriangle,
  User,
  Calendar,
  Gauge,
  FileText,
  RotateCcw
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { apiService } from '../services/api';
import { fmtDate, statusBadge } from '../utils/format';

const FLEET_STATUSES = ['Available', 'In Transit', 'Maintenance', 'Out of Service'];

const CEU_DRIVER_PRESETS = [
  'Mang Ben Santos (Campus Transport)',
  'Kuya Rolly Mendoza (Admin Pool)',
  'Edgardo "Mang Ed" Ramos (Student Affairs)',
  'Property Logistics Pool'
];

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [form, setForm] = useState({
    plateNumber: '',
    model: '',
    capacity: '',
    fleetStatus: 'Available',
    assignedDriverId: '',
    mileage: '',
    nextMaintenanceDate: '',
    notes: ''
  });

  const loadVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getVehicles();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load fleet vehicles');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      await apiService.createVehicle({
        ...form,
        capacity: form.capacity ? parseInt(form.capacity, 10) : null,
        mileage: form.mileage ? parseInt(form.mileage, 10) : 0,
        nextMaintenanceDate: form.nextMaintenanceDate || null
      });
      setIsModalOpen(false);
      setForm({
        plateNumber: '',
        model: '',
        capacity: '',
        fleetStatus: 'Available',
        assignedDriverId: '',
        mileage: '',
        nextMaintenanceDate: '',
        notes: ''
      });
      await loadVehicles();
    } catch (err) {
      setModalError(err.message || 'Failed to create vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (vehicle) => {
    if (!window.confirm(`Delete vehicle ${vehicle.plateNumber} (${vehicle.model}) from CEU fleet?`)) return;
    try {
      await apiService.deleteVehicle(vehicle.id);
      await loadVehicles();
    } catch (err) {
      alert(`Cannot delete vehicle: ${err.message}`);
    }
  };

  const handleStatusChange = async (vehicle, newStatus) => {
    try {
      await apiService.updateVehicle(vehicle.id, { fleetStatus: newStatus });
      await loadVehicles();
    } catch (err) {
      alert(`Cannot update status: ${err.message}`);
    }
  };

  const filtered = vehicles.filter(v => {
    const term = search.toLowerCase();
    const matchesSearch = (v.plateNumber || '').toLowerCase().includes(term) ||
                          (v.model || '').toLowerCase().includes(term) ||
                          (v.assignedDriverId || '').toLowerCase().includes(term) ||
                          (v.notes || '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'All' || v.fleetStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableCount = vehicles.filter(v => v.fleetStatus === 'Available').length;
  const transitCount = vehicles.filter(v => v.fleetStatus === 'In Transit').length;
  const maintenanceCount = vehicles.filter(v => v.fleetStatus === 'Maintenance' || v.fleetStatus === 'Out of Service').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet & Vehicle Management</h1>
          <p className="page-subtitle">Centro Escolar University Official Transport, Shuttles, and Logistics Fleet</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Add Fleet Vehicle
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="stats-grid">
        <StatCard 
          title="Total Fleet Vehicles" 
          value={loading ? '—' : vehicles.length} 
          icon={Truck} 
          color="#6366f1" 
        />
        <StatCard 
          title="Available for Dispatch" 
          value={loading ? '—' : availableCount} 
          icon={CheckCircle2} 
          color="#10b981" 
        />
        <StatCard 
          title="Currently In Transit" 
          value={loading ? '—' : transitCount} 
          icon={Navigation} 
          color="#06b6d4" 
        />
        <StatCard 
          title="In Maintenance / Service" 
          value={loading ? '—' : maintenanceCount} 
          icon={Wrench} 
          color="#f59e0b" 
        />
      </div>

      {/* Vehicles Table Card */}
      <div className="card-level-1" style={{ padding: 0, overflow: 'hidden' }}>
        
        {/* Filters Bar */}
        <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search plate, model, driver, or campus purpose..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
              style={{ width: '100%', paddingLeft: '2.25rem' }}
            />
          </div>

          <div style={{ width: '190px' }}>
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="form-control"
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
            >
              <option value="All">All Fleet Statuses</option>
              {FLEET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button onClick={loadVehicles} className="btn btn-secondary btn-sm" title="Reload Fleet Records">
            <RotateCcw size={14} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading-state" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading Centro Escolar University fleet records...
          </div>
        ) : error ? (
          <div className="empty-state" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <AlertTriangle size={36} color="var(--color-warning)" style={{ margin: '0 auto 0.75rem auto' }} />
            <p style={{ color: 'var(--color-error)', fontWeight: 600 }}>{error}</p>
            <button onClick={loadVehicles} className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
            <Truck size={42} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
            <strong>No vehicles found</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {vehicles.length === 0 ? "No fleet vehicles have been registered yet." : "No vehicles match the selected filter."}
            </p>
            {vehicles.length === 0 && (
              <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                <Plus size={16} /> Register First Vehicle
              </button>
            )}
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>PLATE NUMBER</th>
                  <th>VEHICLE / PURPOSE</th>
                  <th style={{ width: '130px' }}>CAPACITY</th>
                  <th style={{ width: '160px' }}>STATUS</th>
                  <th>ASSIGNED DRIVER</th>
                  <th style={{ width: '120px' }}>MILEAGE</th>
                  <th style={{ width: '140px' }}>NEXT SERVICE</th>
                  <th style={{ textAlign: 'right', width: '90px' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(vehicle => {
                  const isAvailable = vehicle.fleetStatus === 'Available';
                  const isInTransit = vehicle.fleetStatus === 'In Transit';
                  const isMaint = vehicle.fleetStatus === 'Maintenance';
                  const badgeClass = isAvailable ? 'badge-available' : isInTransit ? 'badge-borrowed' : isMaint ? 'badge-maintenance' : 'badge-overdue';

                  return (
                    <tr key={vehicle.id}>
                      <td>
                        <span style={{ 
                          fontFamily: 'monospace', 
                          fontWeight: 800, 
                          fontSize: '0.92rem',
                          background: 'var(--surface-container)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          display: 'inline-block',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-main)'
                        }}>
                          {vehicle.plateNumber}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{vehicle.model}</div>
                        {vehicle.notes && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {vehicle.notes}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {vehicle.capacity ? (
                          <span>{vehicle.capacity >= 100 ? `${vehicle.capacity.toLocaleString()} kg` : `${vehicle.capacity} seats`}</span>
                        ) : '—'}
                      </td>
                      <td>
                        <select 
                          value={vehicle.fleetStatus}
                          onChange={e => handleStatusChange(vehicle, e.target.value)}
                          className={`badge ${badgeClass}`}
                          style={{ border: 'none', cursor: 'pointer', outline: 'none', padding: '0.3rem 0.6rem', fontWeight: 700, fontSize: '0.78rem' }}
                        >
                          {FLEET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                          <User size={14} color="var(--text-muted)" />
                          <span>{vehicle.assignedDriverId || 'Unassigned (Transport Pool)'}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : '0 km'}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {fmtDate(vehicle.nextMaintenanceDate)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => handleDelete(vehicle)}
                          className="icon-btn" 
                          title="Delete vehicle from fleet"
                        >
                          <Trash2 size={16} color="var(--color-error)" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Showing <strong>{filtered.length}</strong> of <strong>{vehicles.length}</strong> CEU fleet vehicles</span>
          <span style={{ fontSize: '0.75rem' }}>Centro Escolar University Property & Fleet Services</span>
        </div>

      </div>

      {/* ADD VEHICLE MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Register CEU Fleet Vehicle</h3>
              <button onClick={() => setIsModalOpen(false)} className="icon-btn"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateVehicle}>
              <div className="modal-body">
                {modalError && <div className="alert alert-error">{modalError}</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Plate Number *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. NGB-1042"
                      className="form-control"
                      value={form.plateNumber}
                      onChange={e => setForm({ ...form, plateNumber: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Vehicle Model *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Mitsubishi L300 FB Exceed 2.2L"
                      className="form-control"
                      value={form.model}
                      onChange={e => setForm({ ...form, model: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Capacity (seats or kg)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 15 seats or 1500 kg"
                      className="form-control"
                      value={form.capacity}
                      onChange={e => setForm({ ...form, capacity: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fleet Status</label>
                    <select 
                      className="form-control"
                      value={form.fleetStatus}
                      onChange={e => setForm({ ...form, fleetStatus: e.target.value })}
                    >
                      {FLEET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Assigned Driver / Campus Staff</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mang Ben Santos"
                      className="form-control"
                      value={form.assignedDriverId}
                      onChange={e => setForm({ ...form, assignedDriverId: e.target.value })}
                      list="ceu-drivers-list"
                    />
                    <datalist id="ceu-drivers-list">
                      {CEU_DRIVER_PRESETS.map(d => <option key={d} value={d} />)}
                    </datalist>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Current Odometer (km)</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      className="form-control"
                      value={form.mileage}
                      onChange={e => setForm({ ...form, mileage: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Next Scheduled Preventive Maintenance</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={form.nextMaintenanceDate}
                    onChange={e => setForm({ ...form, nextMaintenanceDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Campus Assignment / Department Notes</label>
                  <textarea 
                    rows="2" 
                    placeholder="e.g. CEU Mendiola - Makati shuttle, inter-campus administrative delegation..."
                    className="form-control"
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Registering...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default VehiclesPage;
