import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('vp-theme', 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark: true, toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}