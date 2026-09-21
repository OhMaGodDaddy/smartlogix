import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    apiService.getNotifications().then(setNotifications);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={16} color="#fbbf24" />;
      case 'info': return <Info size={16} color="#22d3ee" />;
      case 'success': return <CheckCircle2 size={16} color="#34d399" />;
      default: return <Bell size={16} color="#a5b4fc" />;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary"
        style={{ padding: '0.5rem', borderRadius: '50%', position: 'relative' }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '0.7rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="glass-card" style={{
          position: 'absolute',
          right: 0,
          top: '50px',
          width: '340px',
          zIndex: 100,
          boxShadow: 'var(--shadow-lg)',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>System Notifications</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer' }}>Mark all read</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.map(item => (
              <div 
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  padding: '0.6rem',
                  borderRadius: '8px',
                  background: item.unread ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  border: item.unread ? '1px solid rgba(99, 102, 241, 0.2)' : 'none'
                }}
              >
                <div style={{ marginTop: '2px' }}>{getIcon(item.type)}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.message}</p>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
