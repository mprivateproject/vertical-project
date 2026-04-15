import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Clock, User } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';

const navItems = [
  { key: 'home', icon: Home, path: '/' },
  { key: 'services', icon: CalendarDays, path: '/services' },
  { key: 'bookingHistory', icon: Clock, path: '/bookings' },
  { key: 'profile', icon: User, path: '/profile' },
];

export default function BottomNav() {
  const { t } = useLang();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1">
        {navItems.map(({ key, icon: Icon, path }) => {
          const isActive = location.pathname === path || 
            (path !== '/' && location.pathname.startsWith(path));
          
          return (
            <Link
              key={key}
              to={path}
              className="relative flex flex-col items-center gap-0.5 py-2 px-4 min-w-[64px] transition-all active:scale-95"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1 w-8 h-0.5 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {t(key)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}