import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import PageHeader from './PageHeader';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24 w-full max-w-md md:max-w-2xl lg:max-w-3xl mx-auto">
        <PageHeader />
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}