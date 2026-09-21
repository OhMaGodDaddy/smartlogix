import React from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import OfficerDashboard from './OfficerDashboard';
import BorrowerDashboard from './BorrowerDashboard';
import ApproverDashboard from './ApproverDashboard';

const DashboardRouter = () => {
  const { activeRole } = useAuth();

  switch (activeRole) {
    case ROLES.ADMIN:
      return <AdminDashboard />;
    case ROLES.OFFICER:
      return <OfficerDashboard />;
    case ROLES.BORROWER:
      return <BorrowerDashboard />;
    case ROLES.APPROVER:
      return <ApproverDashboard />;
    default:
      return <BorrowerDashboard />;
  }
};

export default DashboardRouter;
