/* global liff */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const LineContext = createContext();

const LIFF_ID = '2009806106-7u8AyzZg';

export function LineProvider({ children }) {
  const [liffReady, setLiffReady] = useState(false);
  const [lineProfile, setLineProfile] = useState(null);
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
        const email = liff.getDecodedIDToken()?.email || '';
        const profileData = {
          lineUserId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
          statusMessage: profile.statusMessage || '',
          email,
        };
        setLineProfile(profileData);
        setIsLoggedIn(true);
        await syncCustomer(profileData);
      }
    } catch (err) {
      console.error('LIFF init failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const syncCustomer = async (profile) => {
    try {
      const existing = await base44.entities.Customer.filter({ line_user_id: profile.lineUserId });
      if (existing.length > 0) {
        const updated = await base44.entities.Customer.update(existing[0].id, {
          display_name: profile.displayName,
          picture_url: profile.pictureUrl,
          email: profile.email || existing[0].email,
        });
        setCustomer(updated);
      } else {
        const created = await base44.entities.Customer.create({
          line_user_id: profile.lineUserId,
          display_name: profile.displayName,
          email: profile.email || '',
          picture_url: profile.pictureUrl || '',
          preferred_language: 'th',
          total_visits: 0,
          total_spent: 0,
          loyalty_points: 0,
          membership_tier: 'none',
        });
        setCustomer(created);
      }
    } catch (err) {
      console.error('Failed to sync customer:', err);
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
    setCustomer(null);
    setIsLoggedIn(false);
    window.location.reload();
  };

  return (
    <LineContext.Provider value={{ lineProfile, customer, isLoggedIn, isLoading, loginWithLine, logout }}>
      {children}
    </LineContext.Provider>
  );
}

export function useLine() {
  const context = useContext(LineContext);
  if (!context) throw new Error('useLine must be used within LineProvider');
  return context;
}