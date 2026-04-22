import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, User } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useSheet } from '@/lib/SheetContext';
import { motion, AnimatePresence } from 'framer-motion';

const E = [0.22, 1, 0.36, 1];
const haptic = (ms = 6) => { if (navigator?.vibrate) navigator.vibrate(ms); };

// "M" monogram center icon — biohacking / ritual vibe
function MIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 16V4L10 11.5L17 4V16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const LEFT_ITEMS = [
  { key: 'home', icon: Home, path: '/' },
  { key: 'bookingsNav', icon: CalendarDays, path: '/bookings' },
];
const RIGHT_ITEMS = [
  { key: 'profile', icon: User, path: '/profile' },
];

export default function BottomNav() {
  const { t } = useLang();
  const { isSheetOpen } = useSheet();
  const location = useLocation();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const NavItem = ({ icon: Icon, path, keyName }) => {
    const active = isActive(path);
    return (
      <Link
        to={path}
        onClick={() => haptic(6)}
        className="flex flex-col items-center gap-[3px] px-4 py-1.5 transition-all active:scale-90"
      >
        <motion.div
          animate={{ scale: active ? 1.12 : 1 }}
          transition={{ type: 'spring', stiffness: 340, damping: 22 }}
        >
          <Icon
            strokeWidth={active ? 2 : 1.4}
            className="w-5 h-5"
            style={{
              color: active ? 'rgba(255,255,255,0.92)' : 'rgba(161,165,173,0.32)',
              filter: active ? 'drop-shadow(0 0 5px rgba(255,255,255,0.25))' : 'none',
              transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
            }}
          />
        </motion.div>
        <AnimatePresence>
          {active && (
            <motion.span
              initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 3 }}
              transition={{ duration: 0.22 }}
              className="text-[11px] tracking-[0.15em] uppercase"
              style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Montserrat, sans-serif' }}
            >
              {t(keyName)}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    );
  };

  if (isSheetOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 px-5">
      <nav
        className="flex items-center"
        style={{
          background: 'rgba(16,18,22,0.75)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '32px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Left items */}
        <div className="flex items-center px-2">
          {LEFT_ITEMS.map(({ key, icon, path }) => (
            <NavItem key={key} keyName={key} icon={icon} path={path} />
          ))}
        </div>

        {/* Center elevated M button */}
        <div className="relative flex items-center justify-center mx-1">
          <Link
            to="/quickbooking"
            onClick={() => haptic(10)}
            className="relative flex items-center justify-center"
            style={{ marginBottom: '10px' }}
          >
            <motion.div
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className="w-12 h-12 flex items-center justify-center rounded-full"
              style={{
                background: 'linear-gradient(150deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 0 28px rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.5)',
              }}
            >
              <MIcon />
            </motion.div>
          </Link>
        </div>

        {/* Right items */}
        <div className="flex items-center px-2">
          {RIGHT_ITEMS.map(({ key, icon, path }) => (
            <NavItem key={key} keyName={key} icon={icon} path={path} />
          ))}
        </div>
      </nav>
    </div>
  );
}