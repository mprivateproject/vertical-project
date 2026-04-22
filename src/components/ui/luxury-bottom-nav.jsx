import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const LuxuryBottomNav = ({ items = [] }) => {
  const location = useLocation();

  const defaultItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Calendar, label: 'Booking', path: '/book' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/preferences' },
  ];

  const navItems = items.length > 0 ? items : defaultItems;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-glass-surface border border-glass-border backdrop-blur-[20px] rounded-pill px-lg py-sm shadow-soft flex items-center gap-lg">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;

          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'p-3 rounded-pill transition-all duration-180 ease-out',
                isActive ? 'text-[#C6A87D] shadow-glow' : 'text-text-secondary hover:text-text-primary'
              )}
              title={label}
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default LuxuryBottomNav;