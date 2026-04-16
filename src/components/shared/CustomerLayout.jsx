import React, { useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

// Preserve scroll position per route
const scrollPositions = {};

export default function CustomerLayout() {
  const location = useLocation();
  const mainRef = useRef(null);

  // Save scroll on route change
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => {
      scrollPositions[location.pathname] = el.scrollTop;
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Restore scroll when route mounts
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const saved = scrollPositions[location.pathname] || 0;
    el.scrollTop = saved;
  }, [location.pathname]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto max-w-lg mx-auto w-full"
        style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
      >
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}