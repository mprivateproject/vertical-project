import React, { createContext, useContext, useState } from 'react';

const LineContext = createContext();

// Simulated LINE LIFF profile for development
// In production, this would use actual LIFF SDK
const MOCK_LINE_PROFILE = {
  lineUserId: 'U1234567890abcdef',
  displayName: 'สมชาย',
  pictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  statusMessage: 'Relaxing at Vertical Project 🧖‍♂️',
};

export function LineProvider({ children }) {
  const [lineProfile, setLineProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginWithLine = async () => {
    setIsLoading(true);
    // Simulate LIFF login delay
    await new Promise(r => setTimeout(r, 800));
    setLineProfile(MOCK_LINE_PROFILE);
    setIsLoggedIn(true);
    setIsLoading(false);
  };

  const logout = () => {
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