import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const ROLES = {
  ADMIN: 'Administrator',
  OFFICER: 'Logistics/Property Officer',
  BORROWER: 'Requester/Borrower',
  APPROVER: 'Approver',
  DRIVER: 'Driver/Delivery Personnel'
};

const MOCK_USERS = {
  [ROLES.ADMIN]: {
    id: 'usr-admin-01',
    name: 'Kyle Carag',
    email: 'kyle.admin@smartlogix.org',
    role: ROLES.ADMIN,
    department: 'System Operations'
  },
  [ROLES.OFFICER]: {
    id: 'usr-officer-01',
    name: 'Mark Miguel',
    email: 'mark.officer@smartlogix.org',
    role: ROLES.OFFICER,
    department: 'Logistics & Property Office'
  },
  [ROLES.BORROWER]: {
    id: 'usr-borrower-01',
    name: 'Pelumi Oloyede',
    email: 'pelumi.student@smartlogix.org',
    role: ROLES.BORROWER,
    department: 'Computer Science Department'
  },
  [ROLES.APPROVER]: {
    id: 'usr-approver-01',
    name: 'Dr. Jane Smith',
    email: 'jane.approver@smartlogix.org',
    role: ROLES.APPROVER,
    department: 'Department Dean / Chair'
  }
};

export const AuthProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState(ROLES.ADMIN);
  const [user, setUser] = useState(MOCK_USERS[ROLES.ADMIN]);

  const switchRole = (newRole) => {
    setActiveRole(newRole);
    if (MOCK_USERS[newRole]) {
      setUser(MOCK_USERS[newRole]);
    } else {
      setUser({
        id: `usr-custom-${Date.now()}`,
        name: `${newRole} User`,
        email: `user@smartlogix.org`,
        role: newRole,
        department: 'SmartLogix'
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, activeRole, switchRole, ROLES }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
