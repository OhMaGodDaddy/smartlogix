import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { apiService, subscribeConnection } from '../services/api';

const Layout = () => {
  const isConnected = useSyncExternalStore(subscribeConnection, apiService.isCloudConnected);

  // On narrow screens the sidebar is a drawer opened from the top bar.
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const onKeyDown = (e) => { if (e.key === 'Escape') setIsMenuOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  return (
    <div className="app-container">
      <Sidebar isOpen={isMenuOpen} onClose={closeMenu} />
      {isMenuOpen && <div className="sidebar-backdrop" onClick={closeMenu} />}
      <div className="main-content">
        <Navbar isMenuOpen={isMenuOpen} onMenuClick={() => setIsMenuOpen(true)} />
        <main className="page-wrapper">
          {!isConnected && (
            <div className="alert alert-warning" role="status">
              <strong>Offline demo mode:</strong> the server is unavailable. You're seeing data stored in this
              browser, and changes made now won't be sent to the server.
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
