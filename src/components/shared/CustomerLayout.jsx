import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import PageHeader from './PageHeader';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24 w-full max-w-md mx-auto">
        <PageHeader />
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}