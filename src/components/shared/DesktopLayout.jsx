import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, User, NotebookPen, Monitor, Tablet, Smartphone } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';
import { useViewMode } from '@/lib/ViewModeContext';
import { AnimatePresence } from 'framer-motion';
import ViewModeSelector from './ViewModeSelector';

const NAV_ITEMS = [
  { key: 'home',        icon: Home,         path: '/',          labelTh: 'หน้าแรก',      labelEn: 'Home' },
  { key: 'bookingsNav', icon: CalendarDays, path: '/bookings',  labelTh: 'การจอง',     labelEn: 'Bookings' },
  { key: 'feedback',    icon: NotebookPen,  path: '/feedback',  labelTh: 'ความคิดเห็น',  labelEn: 'Feedback' },
  { key: 'profile',     icon: User,         path: '/profile',   labelTh: 'โปรไฟล์',    labelEn: 'Profile' }];

const BG_IMAGE = 'https://media.base44.com/images/public/69df58a04843389be3df3f2e/99865a990_ChatGPTImageApr19202605_04_53PM.png';

export default function DesktopLayout({ isTablet = false }) {
  const { pathname }          = useLocation();
  const { lang, toggleLang }  = useLang();
  const { isDark, toggleTheme } = useTheme();
  const { viewMode, setMode } = useViewMode();
  const [showSelector, setShowSelector] = useState(false);

  const isActive  = (path) => path === '/' ? pathname === '/' : pathname.startsWith(path);
  const isHome    = pathname === '/';

  const viewIcon  = viewMode === 'desktop' ? Monitor : Tablet;
  const ViewIcon  = viewIcon;

  return (
    <div
      className="flex min-h-screen"
      style={{ background: isDark ? '#0a0908' : '#f5f2ee' }}
    >
      {/* ── SIDEBAR ── */}
      <aside
        style={{
          width:            isTablet ? '72px' : '220px',
          flexShrink:       0,
          // Hide sidebar on the Home (/) splash page — it is a fullscreen landing
          display:          isHome ? 'none' : 'flex',
          flexDirection:    'column',
          background:       isDark ? 'rgba(10,9,8,0.95)' : 'rgba(245,242,238,0.95)',
          borderRight:      isDark ? '1px solid rgba(203,187,160,0.08)' : '1px solid rgba(203,187,160,0.25)',
          backdropFilter:   'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          position:         'sticky',
          top:              0,
          height:           '100vh',
          overflowY:        'auto'
        }}
      >
        {/* Logo */}
        <div style={{ padding: isTablet ? '24px 0 16px' : '28px 20px 16px', textAlign: isTablet ? 'center' : 'left' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: isDark ? 'rgba(203,187,160,0.12)' : 'rgba(60,50,40,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 700,
              color: isDark ? 'rgba(203,187,160,0.9)' : 'rgba(60,50,40,0.8)',
              fontFamily: 'Georgia, serif', letterSpacing: '0.05em',
              margin: isTablet ? '0 auto' : '0'
            }}>M</div>
          </Link>
          {!isTablet &&
            <div style={{
              marginTop: '8px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em',
              color: isDark ? 'rgba(203,187,160,0.45)' : 'rgba(60,50,40,0.45)',
              textTransform: 'uppercase', fontFamily: 'Inter, system-ui, sans-serif'
            }}>Private Project</div>
          }
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: isTablet ? '8px 0' : '8px 12px' }}>
          {NAV_ITEMS.map(({ key, icon: Icon, path, labelTh, labelEn }) => {
            const active = isActive(path);
            return (
              <Link
                key={key}
                to={path}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: '10px',
                  padding: isTablet ? '10px 0' : '9px 12px',
                  borderRadius: '10px',
                  margin: '2px 0',
                  justifyContent: isTablet ? 'center' : 'flex-start',
                  textDecoration: 'none',
                  background: active
                    ? (isDark ? 'rgba(203,187,160,0.1)' : 'rgba(60,50,40,0.08)')
                    : 'transparent',
                  color: active
                    ? (isDark ? 'rgba(203,187,160,0.95)' : 'rgba(60,50,40,0.9)')
                    : (isDark ? 'rgba(203,187,160,0.4)'  : 'rgba(60,50,40,0.45)'),
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} strokeWidth={1.6} />
                {!isTablet &&
                  <span style={{ fontSize: '13px', fontWeight: 450, fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {lang === 'th' ? labelTh : labelEn}
                  </span>
                }
              </Link>
            );
          })}

          {/* Self Booking link */}
          <Link
            to="/selfbooking"
            style={{
              display: 'flex', alignItems: 'center',
              gap: '10px',
              padding: isTablet ? '10px 0' : '9px 12px',
              borderRadius: '10px',
              margin: '2px 0',
              justifyContent: isTablet ? 'center' : 'flex-start',
              textDecoration: 'none',
              background: pathname === '/selfbooking'
                ? (isDark ? 'rgba(203,187,160,0.1)' : 'rgba(60,50,40,0.08)')
                : 'transparent',
              color: pathname === '/selfbooking'
                ? (isDark ? 'rgba(203,187,160,0.95)' : 'rgba(60,50,40,0.9)')
                : (isDark ? 'rgba(203,187,160,0.4)'  : 'rgba(60,50,40,0.45)'),
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{
              width: '16px', height: '16px', borderRadius: '4px',
              background: isDark ? 'rgba(203,187,160,0.15)' : 'rgba(60,50,40,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', fontWeight: 700,
              color: isDark ? 'rgba(203,187,160,0.7)' : 'rgba(60,50,40,0.6)',
              fontFamily: 'Georgia, serif'
            }}>M</div>
            {!isTablet &&
              <span style={{ fontSize: '13px', fontWeight: 450, fontFamily: 'Inter, system-ui, sans-serif' }}>
                Self Booking
              </span>
            }
          </Link>
        </nav>

        {/* Bottom controls */}
        <div style={{ padding: isTablet ? '12px 0 20px' : '12px 12px 20px' }}>

          {/* Language toggle */}
          {!isTablet &&
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '8px', paddingLeft: '12px' }}>
              {['TH', 'EN'].map((l, i) =>
                <button
                  key={l}
                  onClick={() => toggleLang()}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
                    fontSize: '11px', fontWeight: lang.toUpperCase() === l ? 600 : 400,
                    color: lang.toUpperCase() === l
                      ? (isDark ? 'rgba(203,187,160,0.9)' : 'rgba(60,50,40,0.85)')
                      : (isDark ? 'rgba(203,187,160,0.3)' : 'rgba(60,50,40,0.3)'),
                    letterSpacing: '0.08em', fontFamily: 'Inter, system-ui, sans-serif'
                  }}
                >{l}{i === 0 && <span style={{ margin: '0 4px', opacity: 0.3 }}>|</span>}</button>
              )}
            </div>
          }

          {/* About / Contact links */}
          {!isTablet &&
            <div style={{ display: 'flex', gap: '12px', paddingLeft: '12px', marginBottom: '8px' }}>
              <Link to="/about"   style={{ fontSize: '11px', color: isDark ? 'rgba(203,187,160,0.3)' : 'rgba(60,50,40,0.3)', textDecoration: 'none', fontFamily: 'Inter, system-ui, sans-serif' }}>about</Link>
              <Link to="/contact" style={{ fontSize: '11px', color: isDark ? 'rgba(203,187,160,0.3)' : 'rgba(60,50,40,0.3)', textDecoration: 'none', fontFamily: 'Inter, system-ui, sans-serif' }}>contact</Link>
            </div>
          }

          {/* View mode button */}
          <button
            onClick={() => setShowSelector(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', borderRadius: '10px',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(60,50,40,0.15)',
              background: 'transparent', cursor: 'pointer',
              color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(60,50,40,0.45)'
            }}
          >
            <ViewIcon size={14} />
            {!isTablet && <span style={{ fontSize: '11px', fontFamily: 'Inter, system-ui, sans-serif' }}>{viewMode} view</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        <Outlet />
      </main>

      {/* View Mode Selector Modal */}
      {showSelector && <ViewModeSelector onClose={() => setShowSelector(false)} />}
    </div>
  );
}
