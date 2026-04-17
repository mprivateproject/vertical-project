/* global liff */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const LineContext = createContext();

const LIFF_ID = '2009806106-7u8AyzZg';

export function LineProvider({ children }) {
  const [liffReady, setLiffReady] = useState(false);
  const [lineProfile, setLineProfile] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    initLiff();
  }, []);

  const initLiff = async () => {
    try {
      await liff.init({ liffId: LIFF_ID });
      setLiffReady(true);

      // If NOT logged in → show login prompt and STOP
      if (!liff.isLoggedIn()) {
        setIsLoading(false);
        setIsLoggedIn(false);
        return;
      }

      // User is logged in → sync with backend
      const profile = await liff.getProfile();
      const token = liff.getIDToken();
      
      const profileData = {
        lineUserId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage || '',
        email: profile.email || '',
      };
      
      setLineProfile(profileData);
      setIdToken(token);

      // Sync with backend to get user and customer
      const result = await syncWithBackend(profileData, token);
      
      setUser(result.user);
      setCustomer(result.customer);
      setIsLoggedIn(true);
      setIsLoading(false);
    } catch (err) {
      console.error('LIFF init failed:', err);
      setIsLoading(false);
      setIsLoggedIn(false);
    }
  };

  const syncWithBackend = async (profile, token) => {
    // Manually call without helper to avoid circular dependency
    console.log('LIFF SYNC REQUEST:', { action: 'syncCustomer', hasIdToken: !!token });
    const result = await base44.functions.invoke('liffSync', {
      action: 'syncCustomer',
      idToken: token,
      profile,
    });
    console.log('LIFF SYNC RESPONSE:', { action: 'syncCustomer', status: 'success' });
    return result.data;
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
    setCustomer(null);
    setUser(null);
    setIdToken(null);
    setIsLoggedIn(false);
    window.location.reload();
  };

  return (
    <LineContext.Provider 
      value={{ 
        lineProfile, 
        customer,
        user,
        idToken,
        isLoading, 
        liffReady, 
        isLoggedIn,
        loginWithLine, 
        logout,
        setLineProfile,
        setCustomer,
        setUser,
        setIdToken,
        setIsLoggedIn,
        initLiff
      }}
    >
      {children}
    </LineContext.Provider>
  );
}

export function useLine() {
  const context = useContext(LineContext);
  if (!context) throw new Error('useLine must be used within LineProvider');
  return context;
}