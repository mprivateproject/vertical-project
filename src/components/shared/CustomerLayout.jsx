import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import PageHeader from './PageHeader';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20 max-w-lg mx-auto">
        <PageHeader />
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}