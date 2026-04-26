import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import PageHeader from './PageHeader';
import DesktopLayout from './DesktopLayout';
import { useViewMode } from '@/lib/ViewModeContext';

function MobileLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  return (
    <div className="min-h-screen bg-background">
      <main className={isHome ? 'w-full' : 'pb-24 w-full'}>
        {!isHome && <PageHeader />}
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

export default function CustomerLayout() {
  const { viewMode } = useViewMode();

  if (viewMode === 'desktop') return <DesktopLayout isTablet={false} />;
  if (viewMode === 'tablet') return <DesktopLayout isTablet={true} />;
  return <MobileLayout />;
}