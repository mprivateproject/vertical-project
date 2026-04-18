import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

const navItems = [
  { key: 'home', icon: Home, path: '/' },
  { key: 'bookingHistory', icon: BookOpen, path: '/bookings' },
];

export default function BottomNav() {
  const { t } = useLang();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-2xl border-t" style={{background: 'rgba(15,17,22,0.95)', borderColor: 'rgba(255,255,255,0.07)'}}>
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-2">
        {navItems.map(({ key, icon: Icon, path }) => {
          const isActive = location.pathname === path ||
            (path !== '/' && location.pathname.startsWith(path));

          return (
            <Link
              key={key}
              to={path}
              className="flex flex-col items-center gap-1 py-2 px-8 transition-all active:scale-90"
            >
              <Icon
                strokeWidth={isActive ? 2 : 1.5}
                className={`w-5 h-5 transition-colors duration-200`}
                style={{ color: isActive ? '#c9a84c' : 'rgba(180,185,200,0.4)' }}
              />
              <span
                className={`text-[10px] tracking-widest uppercase font-medium transition-colors duration-200`}
                style={{ color: isActive ? '#c9a84c' : 'rgba(180,185,200,0.35)', fontFamily: 'Montserrat, sans-serif' }}
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