import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { QrCode, Camera, ShieldCheck, CheckCircle2, ArrowRightLeft, Plus, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { apiService } from '../services/api';
import { statusBadge, ASSET_CONDITIONS } from '../utils/format';
import { useAuth } from '../context/AuthContext';

const QRScanPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const queryRef = searchParams.get('qrRef') || searchParams.get('assetId') || '';

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [scannedAsset, setScannedAsset] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Checkout inputs
  const [borrowerName, setBorrowerName] = useState(user?.name || '');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [returnCondition, setReturnCondition] = useState('Good');

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAssets();
      const list = Array.isArray(data) ? data : [];
      setAssets(list);
      
      if (list.length > 0) {
        let initial = null;
        if (queryRef) {
          initial = list.find(a => a.id === queryRef || a.qrCodeRef === queryRef || a.assetTag === queryRef);
        }
        if (!initial) initial = list[0];
        setSelectedAssetId(initial.id);
        setScannedAsset(initial);
      }
    } catch (err) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAsset = (id) => {
    setSelectedAssetId(id);
    setIsScanning(true);
    setTimeout(() => {
      const found = assets.find(a => a.id === id);
      setScannedAsset(found || null);
      setIsScanning(false);
    }, 400);
  };

  const handleCheckout = async () => {
    if (!scannedAsset) return;
    if (!borrowerName) {
      setActionError('Borrower name is required');
      return;
    }
    if (!expectedReturnDate) {
      setActionError('Expected return date is required');
      return;
    }
    setActionError('');
    try {
      await apiService.checkoutAsset(scannedAsset.id, {
        borrowerName,
        expectedReturnDate: new Date(expectedReturnDate).toISOString(),
        releasedBy: user?.id,
        releasedByName: user?.name,
        conditionAtRelease: scannedAsset.condition
      });
      setActionSuccess(`Asset ${scannedAsset.name} checked out to ${borrowerName}! Digital logbook entry created.`);
      await loadAssets();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleReturn = async () => {
    if (!scannedAsset) return;
    setActionError('');
    try {
      await apiService.returnAsset(scannedAsset.id, {
        conditionAtReturn: returnCondition
      });
      setActionSuccess(`Asset ${scannedAsset.name} returned successfully!`);
      await loadAssets();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">QR Code Asset Identification & Logbook</h1>
          <p className="page-subtitle">Instant QR verification, digital release checkout, and return check-in</p>
        </div>
      </div>

      {loading ? (
        <div className="glass-card loading-state">
          <Clock size={24} style={{ margin: '0 auto 0.5rem auto', opacity: 0.6 }} />
          <p>Loading asset directory...</p>
        </div>
      ) : assets.length === 0 ? (
        <div className="glass-card empty-state">
          <QrCode size={48} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
          <strong>No registered assets</strong>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            Add assets to your inventory first to generate QR codes and process digital handoffs.
          </p>
          <button onClick={() => navigate('/inventory?action=new')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            <Plus size={16} /> Register First Asset
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {/* Camera Viewfinder Box */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="glass-card-header" style={{ width: '100%' }}>
              <h3 className="glass-card-title">Digital QR Scanner</h3>
              <span className="badge badge-success"><Camera size={14} /> Active</span>
            </div>

            <div 
              style={{ 
                width: '100%', 
                height: '240px', 
                background: 'var(--surface-low)', 
                borderRadius: '12px', 
                border: '2px dashed var(--color-primary)', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                position: 'relative',
                overflow: 'hidden',
                margin: '1rem 0'
              }}
            >
              {scannedAsset ? (
                <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px' }}>
                  <QRCodeSVG value={scannedAsset.qrCodeRef || scannedAsset.assetTag} size={120} />
                </div>
              ) : (
                <QrCode size={64} style={{ opacity: isScanning ? 0.4 : 0.8 }} />
              )}
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                {isScanning ? 'Verifying QR signature...' : (scannedAsset ? scannedAsset.qrCodeRef : 'Select an asset below')}
              </p>
            </div>

            <div style={{ width: '100%' }}>
              <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Select Asset by Tag</label>
              <select 
                value={selectedAssetId}
                onChange={(e) => handleSelectAsset(e.target.value)}
                className="form-control"
              >
                {assets.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.assetTag}) - [{asset.status}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scanned Asset Details Card */}
          <div className="glass-card">
            <div className="glass-card-header">
              <h3 className="glass-card-title">Digital Log Verification</h3>
              <ShieldCheck size={18} color="var(--color-secondary)" />
            </div>

            {actionSuccess && (
              <div className="alert alert-success">{actionSuccess}</div>
            )}
            {actionError && (
              <div className="alert alert-error">{actionError}</div>
            )}

            {scannedAsset && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="badge" style={{ background: 'var(--surface-high)' }}>{scannedAsset.assetTag}</span>
                  <span className={`badge ${statusBadge(scannedAsset.status)}`}>{scannedAsset.status}</span>
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  {scannedAsset.name}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {scannedAsset.description || `${scannedAsset.category} located at ${scannedAsset.location}`}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--surface-low)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  <div>Location: <strong>{scannedAsset.location}</strong></div>
                  <div>Condition: <strong style={{ color: 'var(--color-secondary)' }}>{scannedAsset.condition}</strong></div>
                  <div>Current Holder: <strong>{scannedAsset.currentHolderName || 'In Vault'}</strong></div>
                  <div>QR Ref: <code style={{ color: 'var(--color-primary)' }}>{scannedAsset.qrCodeRef}</code></div>
                </div>

                {scannedAsset.status === 'Available' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Borrower Name</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="Borrower full name"
                        value={borrowerName}
                        onChange={e => setBorrowerName(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Expected Return Date</label>
                      <input 
                        type="datetime-local" 
                        className="form-control"
                        value={expectedReturnDate}
                        onChange={e => setExpectedReturnDate(e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={handleCheckout}
                      className="btn btn-primary" 
                    >
                      <ArrowRightLeft size={16} /> Execute Digital Release (Checkout)
                    </button>
                  </div>
                )}

                {scannedAsset.status === 'Borrowed' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Condition at Return</label>
                      <select 
                        className="form-control"
                        value={returnCondition}
                        onChange={e => setReturnCondition(e.target.value)}
                      >
                        {ASSET_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <button 
                      onClick={handleReturn}
                      className="btn btn-success"
                    >
                      <CheckCircle2 size={16} /> Confirm Asset Return (Check-In)
                    </button>
                  </div>
                )}

                {scannedAsset.status !== 'Available' && scannedAsset.status !== 'Borrowed' && (
                  <div className="alert alert-error">
                    Asset is currently {scannedAsset.status}. Only Available assets can be checked out.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanPage;
