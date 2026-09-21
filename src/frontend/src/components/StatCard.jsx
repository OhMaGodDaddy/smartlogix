import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = '#6366f1', change, subtitle }) => {
  return (
    <div className="glass-card stat-card">
      <div 
        className="stat-icon-wrapper" 
        style={{ 
          background: `${color}20`, 
          color: color, 
          border: `1px solid ${color}40` 
        }}
      >
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-info">
        <span className="stat-label">{title}</span>
        <span className="stat-value">{value}</span>
        {change && (
          <span className="stat-change" style={{ color: change.startsWith('+') ? '#34d399' : '#f87171' }}>
            {change}
          </span>
        )}
        {subtitle && <span className="stat-label" style={{ fontSize: '0.75rem', marginTop: '0.1rem' }}>{subtitle}</span>}
      </div>
    </div>
  );
};

export default StatCard;
