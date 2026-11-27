import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, History, Sun, Moon, UserCheck, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ isMenuOpen, onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, activeRole, switchRole, ROLES } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const term = new FormData(e.currentTarget).get('q').trim();
    navigate(`/inventory?q=${encodeURIComponent(term)}`);
  };

  return (
    <header className="topbar">
      <button
        type="button"
        className="icon-btn menu-btn"
        onClick={onMenuClick}
        aria-label="Open menu"
        aria-expanded={isMenuOpen}
        aria-controls="app-sidebar"
      >
        <Menu size={20} />
      </button>
      <span className="topbar-brand">SmartLogix</span>

        <form className="search-box" role="search" onSubmit={handleSearch}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="search"
            name="q"
            aria-label="Search assets"
            placeholder="Search assets, then press Enter"
            className="search-input"
          />
        </form>

      <div className="topbar-actions">
        {/* Role Selector Badge */}
        <div className="role-badge-select">
          <UserCheck size={14} color="var(--color-primary)" />
          <select aria-label="Active role" value={activeRole} onChange={(e) => switchRole(e.target.value)}>
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
          {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="var(--color-primary)" />}
        </button>

        <NotificationDropdown />

        <button onClick={() => navigate('/logbook')} className="icon-btn" title="Logbook history" aria-label="Logbook history">
          <History size={18} />
        </button>

        {/* User Profile Avatar */}
        <div className="avatar" title={`${user.name} • ${user.department}`}>
          {user.name ? user.name.charAt(0) : 'S'}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
