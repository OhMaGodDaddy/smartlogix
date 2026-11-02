import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/format';

const NotificationDropdown = () => {
  const { user, activeRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = () => {
    apiService.getNotifications({ recipientId: user?.id, role: activeRole })
      .then(data => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]));
  };

  useEffect(() => {
    loadNotifications();
  }, [user, activeRole]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await apiService.markAllNotificationsRead({ recipientId: user?.id, role: activeRole });
      loadNotifications();
    } catch {
      // Ignore
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await apiService.markNotificationRead(id);
      loadNotifications();
    } catch {
      // Ignore
    }
  };

  const getIcon = (level) => {
    switch (level) {
      case 'warning': return <AlertTriangle size={16} color="#fbbf24" />;
      case 'success': return <CheckCircle2 size={16} color="#34d399" />;
      default: return <Info size={16} color="#38bdf8" />;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="icon-btn"
        title="Notifications"
        style={{ position: 'relative' }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            background: 'var(--color-error)',
            color: 'white',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            fontSize: '0.65rem',
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
          top: '46px',
          width: '340px',
          zIndex: 100,
          boxShadow: 'var(--shadow-lg)',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>System Notifications</h4>
            {unreadCount > 0 && (
              <span 
                onClick={handleMarkAllRead} 
                style={{ fontSize: '0.75rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Mark all read
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', padding: '1.5rem 0' }}>
                No active notifications.
              </p>
            ) : (
              notifications.map(item => (
                <div 
                  key={item.id}
                  onClick={() => !item.isRead && handleMarkOneRead(item.id)}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    background: !item.isRead ? 'var(--surface-low)' : 'transparent',
                    border: !item.isRead ? '1px solid var(--border-color)' : '1px solid transparent',
                    cursor: !item.isRead ? 'pointer' : 'default'
                  }}
                >
                  <div style={{ marginTop: '2px' }}>{getIcon(item.level)}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.title || item.event}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.message}</p>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      {timeAgo(item.createdAt || item.sentAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
