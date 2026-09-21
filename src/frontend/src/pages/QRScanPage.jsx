import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QrCode, Camera, ShieldCheck, CheckCircle2, ArrowRightLeft, Sparkles } from 'lucide-react';
import { apiService, MOCK_ASSETS } from '../services/api';

const QRScanPage = () => {
  const [searchParams] = useSearchParams();
  const initialQrRef = searchParams.get('qrRef') || 'QR-AST-101-EPSON';

  const [selectedQr, setSelectedQr] = useState(initialQrRef);
  const [scannedAsset, setScannedAsset] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    handleScan(selectedQr);
  }, [selectedQr]);

  const handleScan = (qrRef) => {
    setIsScanning(true);
    setTimeout(() => {
      const asset = MOCK_ASSETS.find(a => a.qrCodeRef === qrRef || a.id === qrRef);
      setScannedAsset(asset || MOCK_ASSETS[0]);
      setIsScanning(false);
    }, 600);
  };

  const processDigitalHandoff = (newStatus) => {
    if (!scannedAsset) return;
    scannedAsset.status = newStatus;
    setActionSuccess(`Digital ${newStatus === 'Borrowed' ? 'Release / Checkout' : 'Return'} verified for ${scannedAsset.name}! Digital Logbook receipt recorded.`);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">QR Code Asset Identification & Logbook</h1>
          <p className="page-subtitle">Mobile-responsive QR code scanner for instant verification, digital release, and return check-in</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Camera Viewfinder Box */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div className="glass-card-header" style={{ width: '100%' }}>
            <h3 className="glass-card-title">Camera Viewfinder</h3>
            <span className="badge badge-available"><Camera size={14} /> Active</span>
          </div>

          <div 
            style={{ 
              width: '100%', 
              height: '240px', 
              background: '#090d16', 
              borderRadius: '12px', 
              border: '2px dashed var(--accent-primary)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              position: 'relative',
              overflow: 'hidden',
              margin: '1rem 0'
            }}
          >
            {/* Simulated Scanning Laser Effect */}
            {isScanning && (
              <div 
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: '#6366f1',
                  boxShadow: '0 0 15px #6366f1',
                  top: '50%',
                  animation: 'scanLaser 1.5s infinite ease-in-out'
                }}
              />
            )}
            
            <QrCode size={64} color="#818cf8" style={{ opacity: isScanning ? 0.4 : 0.8 }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
              {isScanning ? 'Scanning QR code...' : 'Align asset QR code within frame'}
            </p>
          </div>

          <div style={{ width: '100%' }}>
            <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Select Demo Asset QR Tag</label>
            <select 
              value={selectedQr}
              onChange={(e) => setSelectedQr(e.target.value)}
              className="form-control"
            >
              {MOCK_ASSETS.map(asset => (
                <option key={asset.id} value={asset.qrCodeRef}>
                  {asset.name} ({asset.qrCodeRef})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scanned Asset Details Card */}
        <div className="glass-card">
          <div className="glass-card-header">
            <h3 className="glass-card-title">Scanned Asset Digital Log</h3>
            <ShieldCheck size={18} color="#34d399" />
          </div>

          {actionSuccess && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {actionSuccess}
            </div>
          )}

          {scannedAsset && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.08)' }}>{scannedAsset.assetTag}</span>
                <span className={`badge badge-${scannedAsset.status.toLowerCase()}`}>{scannedAsset.status}</span>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                {scannedAsset.name}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                {scannedAsset.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.5)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                <div>Location: <strong>{scannedAsset.location}</strong></div>
                <div>Condition: <strong style={{ color: '#34d399' }}>{scannedAsset.condition}</strong></div>
                <div>QR Verification Ref: <code style={{ color: '#a5b4fc' }}>{scannedAsset.qrCodeRef}</code></div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  onClick={() => processDigitalHandoff('Borrowed')}
                  className="btn btn-primary" 
                  disabled={scannedAsset.status === 'Borrowed'}
                >
                  <ArrowRightLeft size={16} /> Execute Digital Release (Checkout)
                </button>
                <button 
                  onClick={() => processDigitalHandoff('Available')}
                  className="btn btn-success"
                  disabled={scannedAsset.status === 'Available'}
                >
                  <CheckCircle2 size={16} /> Confirm Asset Return (Check-In)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanPage;
