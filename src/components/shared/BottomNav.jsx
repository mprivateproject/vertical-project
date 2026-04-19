import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { key: 'home', icon: Home, path: '/' },
  { key: 'bookingHistory', icon: BookOpen, path: '/bookings' },
];

export default function BottomNav() {
  const { t } = useLang();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-5 px-6">
      <nav
        className="flex items-center gap-1 px-5 py-3"
        style={{
          background: 'rgba(20,22,26,0.7)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '28px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          minWidth: '180px',
        }}
      >
        {navItems.map(({ key, icon: Icon, path }) => {
          const isActive = location.pathname === path ||
            (path !== '/' && location.pathname.startsWith(path));

          return (
            <Link
              key={key}
              to={path}
              className="relative flex flex-col items-center gap-1 px-8 py-1.5 rounded-2xl transition-all active:scale-90"
            >
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Icon
                  strokeWidth={isActive ? 2 : 1.5}
                  className="w-5 h-5 transition-all duration-300"
                  style={{
                    color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(161,165,173,0.35)',
                    filter: isActive ? 'drop-shadow(0 0 6px rgba(255,255,255,0.3))' : 'none',
                  }}
                />
              </motion.div>
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 3 }}
                    transition={{ duration: 0.2 }}
                    className="text-[9px] tracking-[0.15em] uppercase font-medium"
                    style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {t(key)}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}