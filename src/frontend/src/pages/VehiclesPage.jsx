import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Trash2, 
  X
} from 'lucide-react';
import { apiService } from '../services/api';
import { fmtDate, statusBadge } from '../utils/format';

const FLEET_STATUSES = ['Available', 'In Transit', 'Maintenance', 'Out of Service'];

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
      setError(err.message);
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
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (vehicle) => {
    if (!window.confirm(`Delete vehicle ${vehicle.plateNumber} (${vehicle.model})?`)) return;
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
                          (v.assignedDriverId || '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'All' || v.fleetStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet & Vehicle Management</h1>
          <p className="page-subtitle">Track organizational service trucks, delivery vans, driver assignments, and maintenance logs</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="card-level-1">
          <span className="stat-label">Total Fleet Vehicles</span>
          <strong className="stat-value">{vehicles.length}</strong>
        </div>
        <div className="card-level-1">
          <span className="stat-label">Available for Dispatch</span>
          <strong className="stat-value" style={{ color: 'var(--color-secondary)' }}>
            {vehicles.filter(v => v.fleetStatus === 'Available').length}
          </strong>
        </div>
        <div className="card-level-1">
          <span className="stat-label">Currently In Transit</span>
          <strong className="stat-value" style={{ color: 'var(--color-primary)' }}>
            {vehicles.filter(v => v.fleetStatus === 'In Transit').length}
          </strong>
        </div>
        <div className="card-level-1">
          <span className="stat-label">In Maintenance / Service</span>
          <strong className="stat-value" style={{ color: 'var(--color-warning)' }}>
            {vehicles.filter(v => v.fleetStatus === 'Maintenance').length}
          </strong>
        </div>
      </div>

      {/* Vehicles Table Card */}
      <div className="card-level-1" style={{ padding: 0, overflow: 'hidden' }}>
        
        {/* Filters */}
        <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by plate number, model, or driver..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ width: '180px' }}>
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="search-input"
            >
              <option value="All">All Fleet Statuses</option>
              {FLEET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button onClick={loadVehicles} className="btn btn-secondary btn-sm">Refresh</button>
        </div>

        {loading ? (
          <div className="loading-state">Loading vehicle fleet records...</div>
        ) : error ? (
          <div className="empty-state">
            <p style={{ color: 'var(--color-error)' }}>{error}</p>
            <button onClick={loadVehicles} className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Truck size={42} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
            <strong>No vehicles found</strong>
            <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
              {vehicles.length === 0 ? "No fleet vehicles have been added yet." : "No vehicles match the selected filter."}
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
                  <th>PLATE NUMBER</th>
                  <th>MODEL</th>
                  <th>CAPACITY</th>
                  <th>STATUS</th>
                  <th>ASSIGNED DRIVER</th>
                  <th>MILEAGE</th>
                  <th>NEXT MAINTENANCE</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(vehicle => (
                  <tr key={vehicle.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                        {vehicle.plateNumber}
                      </strong>
                    </td>
                    <td style={{ fontWeight: 600 }}>{vehicle.model}</td>
                    <td>{vehicle.capacity ? `${vehicle.capacity} kg / seats` : '—'}</td>
                    <td>
                      <select 
                        value={vehicle.fleetStatus}
                        onChange={e => handleStatusChange(vehicle, e.target.value)}
                        className={`badge ${statusBadge(vehicle.fleetStatus)}`}
                        style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                      >
                        {FLEET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>{vehicle.assignedDriverId || 'Unassigned'}</td>
                    <td>{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : '0 km'}</td>
                    <td>{fmtDate(vehicle.nextMaintenanceDate)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDelete(vehicle)}
                        className="icon-btn" 
                        title="Delete vehicle"
                      >
                        <Trash2 size={15} color="var(--color-error)" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>Showing {filtered.length} of {vehicles.length} vehicles</span>
        </div>

      </div>

      {/* ADD VEHICLE MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Register Fleet Vehicle</h3>
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
                      placeholder="e.g. ABC-1234"
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
                      placeholder="e.g. Isuzu D-Max Service Truck"
                      className="form-control"
                      value={form.model}
                      onChange={e => setForm({ ...form, model: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Capacity (kg or seating)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 1500"
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
                    <label className="form-label">Assigned Driver / Operative</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Marcus Chen"
                      className="form-control"
                      value={form.assignedDriverId}
                      onChange={e => setForm({ ...form, assignedDriverId: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Current Mileage (km)</label>
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
                  <label className="form-label">Next Scheduled Maintenance Date</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={form.nextMaintenanceDate}
                    onChange={e => setForm({ ...form, nextMaintenanceDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fleet Notes & Registration Info</label>
                  <textarea 
                    rows="2" 
                    placeholder="Chassis number, fuel card ref, department assignment..."
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
                  {submitting ? 'Registering...' : 'Add Vehicle'}
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
