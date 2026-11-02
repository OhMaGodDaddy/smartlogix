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
  Plus 
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">S</div>
        <div>
          <h1 className="sidebar-brand-title">SMARTLOGIX</h1>
          <p className="sidebar-brand-subtitle">Centro Escolar University</p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="sidebar-cta">
        <button 
          onClick={() => navigate('/inventory')} 
          className="btn-new-asset"
        >
          <Plus size={18} />
          <span>New Asset</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-menu">
        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/inventory" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Package size={18} />
          <span>Inventory</span>
        </NavLink>

        <NavLink to="/logbook" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <BookOpen size={18} />
          <span>Logbook</span>
        </NavLink>

        <NavLink to="/requests" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FileCheck size={18} />
          <span>Requests</span>
        </NavLink>

        <NavLink to="/vehicles" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Truck size={18} />
          <span>Vehicles</span>
        </NavLink>

        <NavLink to="/qr-scan" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <MapPin size={18} />
          <span>Tracking / QR</span>
        </NavLink>

        <NavLink to="/analytics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <BarChart3 size={18} />
          <span>Reports</span>
        </NavLink>
      </nav>

      {/* Footer Navigation */}
      <div className="sidebar-footer">
        <NavLink to="/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
        <a href="#support" onClick={(e) => { e.preventDefault(); alert('SmartLogix Support System: support@smartlogix.org'); }} className="sidebar-link">
          <HelpCircle size={18} />
          <span>Support</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
