import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPinOverlay, setShowPinOverlay] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  const login = (pin) => {
    const adminPin = import.meta.env.VITE_ADMIN_PIN || '4973';
    if (pin === adminPin) {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      setShowPinOverlay(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    setShowPinOverlay(false);
  };

  const requireAuth = () => {
    if (!isAuthenticated) {
      setShowPinOverlay(true);
      return false;
    }
    return true;
  };

  const value = {
    isAuthenticated,
    showPinOverlay,
    login,
    logout,
    requireAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
