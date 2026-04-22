import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Plus, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const LuxuryBottomNav = ({ onCenterClick }) => {
  const location = useLocation();

  const items = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Calendar, label: 'Booking', path: '/book' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-nav rounded-full px-6 py-3 flex items-center gap-8 shadow-soft">
        {/* Left items */}
        {items.map(({ icon: IconComponent, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'p-2.5 rounded-lg transition-all duration-180 ease-out',
                isActive
                  ? 'text-cyan-400 bg-blue-500/20 shadow-glow'
                  : 'text-text-secondary hover:text-text-primary'
              )}
              title={label}
            >
              <IconComponent className="w-5 h-5" />
            </Link>
          );
        })}

        {/* Center M button with purple gradient */}
        <button
          onClick={onCenterClick}
          className="relative -mx-2 w-12 h-12 rounded-full bg-gradient-to-br from-[#d946ef] via-[#a855f7] to-[#3b82f6] flex items-center justify-center text-white font-bold text-lg shadow-glow-purple hover:shadow-lg hover:scale-110 transition-all duration-180 ease-out"
        >
          M
        </button>

        {/* Right items */}
        <Link
          to="/profile"
          className={cn(
            'p-2.5 rounded-lg transition-all duration-180 ease-out',
            location.pathname === '/profile'
              ? 'text-cyan-400 bg-blue-500/20 shadow-glow'
              : 'text-text-secondary hover:text-text-primary'
          )}
          title="Profile"
        >
          <User className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default LuxuryBottomNav;