import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const LineContext = createContext();

export function LineProvider({ children }) {
  const { user, isAuthenticated, isLoadingAuth, logout: authLogout } = useAuth();
  const [lineProfile, setLineProfile] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      setLineProfile({
        lineUserId: user.data?.lineUserId || user.id,
        displayName: user.full_name || user.data?.displayName,
        pictureUrl: user.data?.pictureUrl,
        statusMessage: user.data?.statusMessage,
      });
    } else {
      setLineProfile(null);
    }
  }, [isAuthenticated, user]);

  const loginWithLine = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  const logout = () => {
    authLogout();
    setLineProfile(null);
  };

  return (
    <LineContext.Provider value={{
      lineProfile,
      isLoggedIn: isAuthenticated,
      isLoading: isLoadingAuth,
      loginWithLine,
      logout,
    }}>
      {children}
    </LineContext.Provider>
  );
}

export function useLine() {
  const ctx = useContext(LineContext);
  if (!ctx) throw new Error('useLine must be used within LineProvider');
  return ctx;
}