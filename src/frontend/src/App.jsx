import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import DashboardOverviewPage from './pages/DashboardOverviewPage';
import InventoryPage from './pages/InventoryPage';
import LogbookPage from './pages/LogbookPage';
import RequestsPage from './pages/RequestsPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import QRScanPage from './pages/QRScanPage';
import RequestFormPage from './pages/RequestFormPage';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import VehiclesPage from './pages/VehiclesPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardOverviewPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="logbook" element={<LogbookPage />} />
              <Route path="requests" element={<RequestsPage />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="officer" element={<OfficerDashboard />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="qr-scan" element={<QRScanPage />} />
              <Route path="request" element={<RequestFormPage />} />
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
