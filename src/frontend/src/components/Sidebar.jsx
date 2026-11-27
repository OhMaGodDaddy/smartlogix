import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  BookOpen, 
  FileCheck, 
  Truck, 
  MapPin, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Plus,
  CalendarPlus,
  CheckSquare,
  Calendar,
  X
} from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { activeRole, user } = useAuth();
  const { notify } = useFeedback();

  const isAdmin = activeRole === ROLES.ADMIN;
  const isOfficer = activeRole === ROLES.OFFICER;
  const isBorrower = activeRole === ROLES.BORROWER;
  const isApprover = activeRole === ROLES.APPROVER;

  const canManageAssets = isAdmin || isOfficer;
  const canViewVehicles = isAdmin || isOfficer || isApprover;
  const canViewAnalytics = isAdmin || isOfficer || isApprover;

  const renderPrimaryCta = () => {
    if (isBorrower) {
      return (
        <button onClick={() => navigate('/request')} className="btn-new-asset">
          <CalendarPlus size={18} />
          <span>Request Asset</span>
        </button>
      );
    }
    if (isApprover) {
      return (
        <button onClick={() => navigate('/requests')} className="btn-new-asset">
          <CheckSquare size={18} />
          <span>Review Queue</span>
        </button>
      );
    }
    return (
      <button onClick={() => navigate('/inventory?action=new')} className="btn-new-asset">
        <Plus size={18} />
        <span>New Asset</span>
      </button>
    );
  };

  return (
    <aside
      id="app-sidebar"
      className={`sidebar ${isOpen ? 'open' : ''}`}
      onClick={(e) => { if (e.target.closest('a, button')) onClose(); }}
    >
      <button type="button" className="icon-btn sidebar-close" aria-label="Close menu">
        <X size={18} />
      </button>

      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">S</div>
        <div>
          <h1 className="sidebar-brand-title">SMARTLOGIX</h1>
          <p className="sidebar-brand-subtitle">Centro Escolar University</p>
        </div>
      </div>

      {/* Active Role Summary Pill */}
      <div style={{ padding: '0 1rem 0.5rem 1rem' }}>
        <div style={{
          padding: '0.5rem 0.75rem',
          borderRadius: '8px',
          background: 'var(--surface-low)',
          border: '1px solid var(--border-color)',
          fontSize: '0.75rem'
        }}>
          <div style={{ fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            {activeRole}
          </div>
          <div style={{ color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name}
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="sidebar-cta">
        {renderPrimaryCta()}
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-menu">
        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>
            {isAdmin ? 'Admin Console' : isOfficer ? 'Officer Workspace' : isApprover ? 'Approver Portal' : 'My Portal'}
          </span>
        </NavLink>

        <NavLink to="/inventory" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Package size={18} />
          <span>{isBorrower ? 'Browse Equipment' : 'Inventory Catalog'}</span>
        </NavLink>

        <NavLink to="/requests" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FileCheck size={18} />
          <span>{isBorrower ? 'My Requests' : isApprover ? 'Approval Queue' : 'Requests & Queue'}</span>
        </NavLink>

        <NavLink to="/calendar" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Calendar size={18} />
          <span>Resource Calendar</span>
        </NavLink>

        <NavLink to="/logbook" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <BookOpen size={18} />
          <span>{isBorrower ? 'My Loan History' : 'Digital Logbook'}</span>
        </NavLink>

        {canViewVehicles && (
          <NavLink to="/vehicles" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Truck size={18} />
            <span>Fleet Vehicles</span>
          </NavLink>
        )}

        <NavLink to="/qr-scan" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <MapPin size={18} />
          <span>{canManageAssets ? 'QR Handoff / Scan' : 'QR Asset Lookup'}</span>
        </NavLink>

        {canViewAnalytics && (
          <NavLink to="/analytics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <BarChart3 size={18} />
            <span>Analytics & Reports</span>
          </NavLink>
        )}
      </nav>

      {/* Footer Navigation */}
      <div className="sidebar-footer">
        {isAdmin && (
          <NavLink to="/overview" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Settings size={18} />
            <span>Global Overview</span>
          </NavLink>
        )}
        <a href="#support" onClick={(e) => { e.preventDefault(); notify('SmartLogix support: support@smartlogix.org', 'info'); }} className="sidebar-link">
          <HelpCircle size={18} />
          <span>Support</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
