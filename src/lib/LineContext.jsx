/* global liff */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const LineContext = createContext();

const LIFF_ID = Deno.env.get('LIFF_ID') || '2009806106-7u8AyzZg';

export function LineProvider({ children }) {
  const [liffReady, setLiffReady] = useState(false);
  const [lineProfile, setLineProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initLiff();
  }, []);

  const initLiff = async () => {
    try {
      await liff.init({ liffId: LIFF_ID });
      setLiffReady(true);

      if (liff.isLoggedIn()) {
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
        await syncCustomer(profileData);
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error('LIFF init failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const syncCustomer = async (profile) => {
    try {
      const res = await base44.functions.invoke('liffSync', {
        action: 'syncCustomer',
        lineUserId: profile.lineUserId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        email: profile.email || '',
      });
      
      if (res.data.user) {
        setUser(res.data.user);
      }
      if (res.data.customer) {
        setCustomer(res.data.customer);
      }
    } catch (err) {
      console.error('Failed to sync customer:', err);
      setIsLoggedIn(false);
    }
  };

  const loginWithLine = () => {
    if (liffReady) {
      liff.login({ redirectUri: window.location.href });
    }
  };

  const logout = () => {
    if (liffReady && liff.isLoggedIn()) {
      liff.logout();
    }
    setLineProfile(null);
    setUser(null);
    setCustomer(null);
    setIsLoggedIn(false);
    window.location.reload();
  };

  return (
    <LineContext.Provider value={{ lineProfile, user, customer, isLoggedIn, isLoading, loginWithLine, logout }}>
      {children}
    </LineContext.Provider>
  );
}

export function useLine() {
  const context = useContext(LineContext);
  if (!context) throw new Error('useLine must be used within LineProvider');
  return context;
}