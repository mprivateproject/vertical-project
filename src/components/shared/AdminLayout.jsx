import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useLang } from '@/lib/LanguageContext';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';
import AdminAuthGuard from './AdminAuthGuard';
import { 
  LayoutDashboard, CalendarDays, Scissors, Users, Star,
  BarChart3, Tag, Settings, Menu, X, GanttChartSquare, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const adminNav = [
  { key: 'adminDashboard', icon: LayoutDashboard, path: '/admin' },
  { key: 'schedule', icon: CalendarDays, path: '/admin/calendar' },
  { key: 'scheduleBoard', icon: GanttChartSquare, path: '/admin/schedule' },
  { key: 'services', icon: Scissors, path: '/admin/services' },
  { key: 'customers', icon: Users, path: '/admin/customers' },
  { key: 'invitedMembers', icon: Star, path: '/admin/invited-members' },
  { key: 'reports', icon: BarChart3, path: '/admin/reports' },
  { key: 'promotions', icon: Tag, path: '/admin/promotions' },
  { key: 'costDashboard', icon: DollarSign, path: '/admin/cost-dashboard' },
  { key: 'settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminLayout() {
  const { t } = useLang();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminAuthGuard>
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-xl font-semibold text-foreground">Vertical</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Admin Panel</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-md hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {adminNav.map(({ key, icon: Icon, path }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={key}
                  to={path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(key)}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-xl border-b border-border px-4 lg:px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1" />
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
    </AdminAuthGuard>
  );
}