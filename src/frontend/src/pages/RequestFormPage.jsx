import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FilePlus, Calendar, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RequestFormPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const preselectedAssetId = searchParams.get('assetId') || '';

  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState(preselectedAssetId);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    apiService.getAssets().then(setAssets);
  }, []);

  useEffect(() => {
    if (preselectedAssetId) setSelectedAssetId(preselectedAssetId);
  }, [preselectedAssetId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const targetAsset = assets.find(a => a.id === selectedAssetId);

    const reservationData = {
      assetId: selectedAssetId,
      assetName: targetAsset ? targetAsset.name : 'Selected Asset',
      userId: user.id,
      userName: user.name,
      startDate,
      endDate,
      purpose
    };

    apiService.createReservation(reservationData).then(() => {
      setSubmitted(true);
      setTimeout(() => {
        navigate('/calendar');
      }, 2000);
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Submit Resource Request</h1>
          <p className="page-subtitle">Reserve organizational equipment and vehicles for official use</p>
        </div>
      </div>

      <div className="glass-card">
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Request Submitted Successfully!</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Your reservation request has been routed to the Approver queue. You will receive an automated notification once reviewed.
            </p>
            <span className="badge badge-pending">Redirecting to Resource Calendar...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Select Equipment / Resource</label>
              <select 
                value={selectedAssetId} 
                onChange={(e) => setSelectedAssetId(e.target.value)}
                required
                className="form-control"
              >
                <option value="">-- Choose an available asset --</option>
                {assets.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.assetTag}) - [{asset.status}]
                  </option>
                ))}
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Borrow Start Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expected Return Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Requester Information</label>
              <input 
                type="text" 
                value={`${user.name} (${user.email}) - ${user.department}`}
                disabled
                className="form-control"
                style={{ opacity: 0.7 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Purpose of Reservation & Usage Notes</label>
              <textarea 
                rows="4" 
                placeholder="Explain why this equipment is needed, location of event, or class project..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
                className="form-control"
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                <FilePlus size={18} /> Submit Reservation Request
              </button>
              <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RequestFormPage;
