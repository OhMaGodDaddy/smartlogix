import React from 'react';
import { Search, Bell, History, HelpCircle, Sun, Moon, UserCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ title = 'Dashboard Overview' }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, activeRole, switchRole, ROLES } = useAuth();

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h2>
        
        <div className="search-box">
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search assets, vehicles..." 
            className="search-input"
          />
        </div>
      </div>

      <div className="topbar-actions">
        {/* Role Selector Badge */}
        <div className="role-badge-select">
          <UserCheck size={14} color="#6366f1" />
          <select value={activeRole} onChange={(e) => switchRole(e.target.value)}>
            <option value={ROLES.ADMIN}>Administrator</option>
            <option value={ROLES.OFFICER}>Logistics Officer</option>
            <option value={ROLES.BORROWER}>Borrower / Student</option>
            <option value={ROLES.APPROVER}>Approver</option>
          </select>
        </div>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme} 
          className="icon-btn"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
        </button>

        <NotificationDropdown />

        <button className="icon-btn" title="Audit History">
          <History size={18} />
        </button>

        {/* User Profile Avatar */}
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.85rem',
          marginLeft: '0.25rem',
          cursor: 'pointer'
        }}>
          {user.name ? user.name.charAt(0) : 'S'}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
