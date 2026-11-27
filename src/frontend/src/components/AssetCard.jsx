import React from 'react';
import { QrCode, MapPin, Tag, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { statusBadge } from '../utils/format';

const AssetCard = ({ asset }) => {
  const navigate = useNavigate();

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="glass-card-header">
        <span className="badge badge-muted">
          {asset.assetTag}
        </span>
        <span className={`badge ${statusBadge(asset.status)}`}>● {asset.status}</span>
      </div>

      <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
        {asset.name}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', flex: 1 }}>
        {asset.description}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Tag size={14} color="var(--color-primary)" />
          <span>Category: <strong style={{ color: 'var(--text-secondary)' }}>{asset.category}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MapPin size={14} color="var(--color-primary)" />
          <span>Location: <strong style={{ color: 'var(--text-secondary)' }}>{asset.location}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={14} color="var(--color-secondary)" />
          <span>Condition: <strong style={{ color: 'var(--color-secondary)' }}>{asset.condition}</strong></span>
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
