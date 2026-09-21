import React from 'react';
import { QrCode, MapPin, Tag, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AssetCard = ({ asset, onScan }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return <span className="badge badge-available">● Available</span>;
      case 'Borrowed':
        return <span className="badge badge-borrowed">● Borrowed</span>;
      case 'Reserved':
        return <span className="badge badge-reserved">● Reserved</span>;
      case 'Maintenance':
        return <span className="badge badge-maintenance">● Maintenance</span>;
      default:
        return <span className="badge badge-pending">● {status}</span>;
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="glass-card-header">
        <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
          {asset.assetTag}
        </span>
        {getStatusBadge(asset.status)}
      </div>

      <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
        {asset.name}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', flex: 1 }}>
        {asset.description}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Tag size={14} color="#a5b4fc" />
          <span>Category: <strong style={{ color: 'var(--text-secondary)' }}>{asset.category}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MapPin size={14} color="#f472b6" />
          <span>Location: <strong style={{ color: 'var(--text-secondary)' }}>{asset.location}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={14} color="#34d399" />
          <span>Condition: <strong style={{ color: '#34d399' }}>{asset.condition}</strong></span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
        <button 
          onClick={() => navigate(`/request?assetId=${asset.id}`)}
          className="btn btn-primary btn-sm"
          style={{ flex: 1 }}
          disabled={asset.status !== 'Available'}
        >
          {asset.status === 'Available' ? 'Reserve / Borrow' : 'Unavailable'}
        </button>
        <button 
          onClick={() => navigate(`/qr-scan?qrRef=${asset.qrCodeRef}`)}
          className="btn btn-secondary btn-sm"
          title="Scan QR Code"
        >
          <QrCode size={16} />
        </button>
      </div>
    </div>
  );
};

export default AssetCard;
