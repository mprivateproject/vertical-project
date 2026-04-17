/* global liff */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const LineContext = createContext();

const LIFF_ID = '2009806106-7u8AyzZg';

export function LineProvider({ children }) {
  const [liffReady, setLiffReady] = useState(false);
  const [lineProfile, setLineProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initLiff();
  }, []);

  const initLiff = async () => {
    try {
      await liff.init({ liffId: LIFF_ID });
      setLiffReady(true);

      // If NOT logged in → call login() and STOP
      if (!liff.isLoggedIn()) {
        setIsLoading(false);
        return;
      }

      // After redirect → call getProfile()
      const profile = await liff.getProfile();
      const decodedToken = liff.getDecodedIDToken();
      const profileData = {
        lineUserId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage || '',
        email: decodedToken?.email || '',
      };
      setLineProfile(profileData);

      // Send profile to /api/liffSync
      await syncWithBackend(profileData);

      // FORCE application reload to rehydrate Base44 session
      window.location.reload();
    } catch (err) {
      console.error('LIFF init failed:', err);
      setIsLoading(false);
    }
  };

  const syncWithBackend = async (profile) => {
    try {
      await base44.functions.invoke('liffSync', {
        action: 'syncCustomer',
        lineUserId: profile.lineUserId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        email: profile.email || '',
      });
    } catch (err) {
      console.error('Failed to sync with backend:', err);
      throw err;
    }
  };

  const loginWithLine = () => {
    if (liffReady && !liff.isLoggedIn()) {
      liff.login({ redirectUri: window.location.href });
    }
  };

  const logout = () => {
    if (liffReady && liff.isLoggedIn()) {
      liff.logout();
    }
    setLineProfile(null);
    window.location.reload();
  };

  return (
    <LineContext.Provider value={{ lineProfile, isLoading, liffReady, loginWithLine, logout }}>
      {children}
    </LineContext.Provider>
  );
}

export function useLine() {
  const context = useContext(LineContext);
  if (!context) throw new Error('useLine must be used within LineProvider');
  return context;
}