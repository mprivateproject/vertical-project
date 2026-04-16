import React, { createContext, useContext, useState, useEffect } from 'react';

const LineContext = createContext();

const LIFF_ID = '2009806106-7u8AyzZg';

export function LineProvider({ children }) {
  const [lineProfile, setLineProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: LIFF_ID });
        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          setLineProfile({
            lineUserId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
            statusMessage: profile.statusMessage,
          });
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error('LIFF init failed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initLiff();
  }, []);

  const loginWithLine = () => {
    liff.login();
  };

  const logout = () => {
    liff.logout();
    setLineProfile(null);
    setIsLoggedIn(false);
  };

  return (
    <LineContext.Provider value={{ lineProfile, isLoggedIn, isLoading, loginWithLine, logout }}>
      {children}
    </LineContext.Provider>
  );
}

export function useLine() {
  const ctx = useContext(LineContext);
  if (!ctx) throw new Error('useLine must be used within LineProvider');
  return ctx;
}