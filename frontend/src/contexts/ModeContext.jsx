import React, { createContext, useContext, useState } from 'react';

const ModeContext = createContext();

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};

export const ModeProvider = ({ children }) => {
  const [mode, setMode] = useState('sales'); // 'sales' (default) | 'purchases'

  const switchMode = (nextMode) => {
    setMode(nextMode);
  };

  const value = {
    mode,
    isSales: mode === 'sales',
    isPurchases: mode === 'purchases',
    switchMode,
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
};