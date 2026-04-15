import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, User } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

const navItems = [
  { key: 'home', icon: Home, path: '/' },
  { key: 'bookingHistory', icon: BookOpen, path: '/bookings' },
  { key: 'profile', icon: User, path: '/profile' },
];

export default function BottomNav() {
  const { t } = useLang();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/96 backdrop-blur-xl border-t border-border/60">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-2">
        {navItems.map(({ key, icon: Icon, path }) => {
          const isActive = location.pathname === path ||
            (path !== '/' && location.pathname.startsWith(path));

          return (
            <Link
              key={key}
              to={path}
              className="flex flex-col items-center gap-1 py-2 px-5 transition-all active:scale-90"
            >
              <Icon
                strokeWidth={isActive ? 2 : 1.5}
                className={`w-5 h-5 transition-colors duration-200 ${
                  isActive ? 'text-foreground' : 'text-muted-foreground/50'
                }`}
              />
              <span
                className={`text-[10px] tracking-wide transition-colors duration-200 ${
                  isActive ? 'text-foreground font-medium' : 'text-muted-foreground/40'
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