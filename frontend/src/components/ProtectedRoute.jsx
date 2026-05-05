import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, requireAuth } = useAuth();

  // Check authentication status
  if (!isAuthenticated) {
    requireAuth();
    return null; // Don't render children while showing PIN overlay
  }

  return children;
};

export default ProtectedRoute;
