import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const ViewModeContext = createContext(null);

export function ViewModeProvider({ children }) {
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('m_view_mode') || 'mobile';
  });

  // On mount: fetch admin-defined default and apply if user has no personal override
  useEffect(() => {
    const hasPersonalOverride = localStorage.getItem('m_view_mode_override') === 'true';
    if (hasPersonalOverride) return; // user chose manually via ViewModeSelector — respect it

    base44.entities.AppSetting.filter({ key: 'default_view_mode' })
      .then(results => {
        if (results.length > 0 && results[0].value) {
          setViewMode(results[0].value);
          localStorage.setItem('m_view_mode', results[0].value);
        }
      })
      .catch(() => {}); // silent fail — keep localStorage value
  }, []);

  const setMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('m_view_mode', mode);
    localStorage.setItem('m_view_mode_override', 'true'); // mark as user-chosen
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, setMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export const useViewMode = () => useContext(ViewModeContext);