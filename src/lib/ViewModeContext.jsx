import React, { createContext, useContext, useState, useEffect } from 'react';

const ViewModeContext = createContext(null);

export function ViewModeProvider({ children }) {
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('m_view_mode') || 'mobile';
  });

  const setMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('m_view_mode', mode);
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, setMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export const useViewMode = () => useContext(ViewModeContext);