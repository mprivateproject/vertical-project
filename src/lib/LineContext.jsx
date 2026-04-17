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
      // 1️⃣ Initialize LIFF with proper ID
      console.log('🔄 LIFF: Initializing with ID:', LIFF_ID);
      await liff.init({ liffId: LIFF_ID });
      setLiffReady(true);
      console.log('✅ LIFF: Initialization complete');

      // 2️⃣ Check login status
      if (!liff.isLoggedIn()) {
        console.warn('⚠️ LIFF: User not logged in');
        setIsLoading(false);
        setIsLoggedIn(false);
        return;
      }

      console.log('✅ LIFF: User is logged in');

      // 3️⃣ Get token AFTER verifying login
      const token = liff.getIDToken();
      if (!token) {
        throw new Error('Failed to get LIFF ID Token after login');
      }
      console.log('✅ LIFF: ID Token retrieved, length:', token.length);

      // 4️⃣ Get profile data
      const profile = await liff.getProfile();
      console.log('✅ LIFF: Profile retrieved:', { userId: profile.userId, displayName: profile.displayName });
      
      const profileData = {
        lineUserId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage || '',
        email: profile.email || '',
      };
      
      setLineProfile(profileData);
      setIdToken(token);

      // 5️⃣ Sync with backend to get user and customer
      console.log('🔄 LIFF: Syncing with backend...');
      const result = await syncWithBackend(profileData, token);
      console.log('✅ LIFF: Backend sync complete');
      
      setUser(result.user);
      setCustomer(result.customer);
      setIsLoggedIn(true);
      setIsLoading(false);
    } catch (err) {
      console.error('❌ LIFF init failed:', err);
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