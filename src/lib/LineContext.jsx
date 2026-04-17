import React, { createContext, useContext } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

// LineContext now bridges to AuthContext (no LIFF)
const LineContext = createContext();

export function LineProvider({ children }) {
  return <LineContext.Provider value={{}}>{children}</LineContext.Provider>;
}

export function useLine() {
  const { user, isAuthenticated, isLoadingAuth, logout } = useAuth();

  const lineProfile = user ? {
    lineUserId: user.data?.lineUserId || user.id,
    displayName: user.full_name,
    pictureUrl: user.data?.pictureUrl || null,
    statusMessage: user.data?.statusMessage || null,
  } : null;

  return {
    lineProfile,
    isLoggedIn: isAuthenticated,
    isLoading: isLoadingAuth,
    loginWithLine: () => base44.auth.redirectToLogin(window.location.href),
    logout: () => logout(true),
  };
}