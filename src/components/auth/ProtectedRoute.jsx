import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const normalizeRole = (role) => {
  const value = String(role || '').toLowerCase();
  if (value === 'faculty') return 'teacher';
  return value;
};

const readCurrentUser = () => {
  try {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const location = useLocation();
  const user = readCurrentUser();
  const role = normalizeRole(user?.role);
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

  if (!user || !role) {
    const loginRole = normalizedAllowedRoles[0] || 'student';
    return <Navigate to={`/login/${loginRole}`} replace state={{ from: location.pathname }} />;
  }

  if (!normalizedAllowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
