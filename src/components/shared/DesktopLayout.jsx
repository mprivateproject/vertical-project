import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, User, NotebookPen, Monitor, Tablet, Smartphone } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';
import { useViewMode } from '@/lib/ViewModeContext';
import { AnimatePresence } from 'framer-motion';
import ViewModeSelector from './ViewModeSelector';

const NAV_ITEMS = [
{ key: 'home', icon: Home, path: '/', labelTh: 'หน้าแรก', labelEn: 'Home' },
{ key: 'bookingsNav', icon: CalendarDays, path: '/bookings', labelTh: 'การจอง', labelEn: 'Bookings' },
{ key: 'feedback', icon: NotebookPen, path: '/feedback', labelTh: 'ความคิดเห็น', labelEn: 'Feedback' },
{ key: 'profile', icon: User, path: '/profile', labelTh: 'โปรไฟล์', labelEn: 'Profile' }];


const BG_IMAGE = 'https://media.base44.com/images/public/69df58a04843389be3df3f2e/99865a990_ChatGPTImageApr19202605_04_53PM.png';

export default function DesktopLayout({ isTablet = false }) {
  const { pathname } = useLocation();
  const { lang, toggleLang } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const { viewMode, setMode } = useViewMode();
  const [showSelector, setShowSelector] = useState(false);

  const isActive = (path) => path === '/' ? pathname === '/' : pathname.startsWith(path);

  const viewIcon = viewMode === 'desktop' ? Monitor : Tablet;
  const ViewIcon = viewIcon;

  return (
    <div
      className="flex min-h-screen"
      style={{ background: isDark ? '#0a0908' : '#f5f2ee' }}>
      
      {/* ── SIDEBAR ── */}
      <aside
        style={{
          width: isTablet ? '72px' : '220px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: isDark ?
          'rgba(10,9,8,0.95)' :
          'rgba(245,242,238,0.95)',
          borderRight: isDark ?
          '1px solid rgba(203,187,160,0.08)' :
          '1px solid rgba(203,187,160,0.25)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto'
        }}>
        
        {/* Logo */}
        <div
          style={{
            padding: isTablet ? '32px 0 24px' : '32px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isTablet ? 'center' : 'flex-start',
            borderBottom: isDark ?
            '1px solid rgba(203,187,160,0.07)' :
            '1px solid rgba(203,187,160,0.2)'
          }}>
          
          <Link to="/" style={{ textDecoration: 'none' }}>
            <p style={{
              fontFamily: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
              fontSize: '32px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: '#E5D3B3',
              lineHeight: 1,
              textShadow: '0 0 20px rgba(229,211,179,0.18)'
            }}>
              M
            </p>
          </Link>
          {!isTablet &&
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '8px',
            fontWeight: 400,
            letterSpacing: '0.4em',
            color: 'rgba(203,187,160,0.4)',
            textTransform: 'uppercase',
            marginTop: '4px'
          }}>
              Private Project
            </p>
          }
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: isTablet ? '16px 0' : '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_ITEMS.map(({ key, icon: Icon, path, labelTh, labelEn }) => {
            const active = isActive(path);
            return (
              <Link
                key={key}
                to={path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: isTablet ? '12px 0' : '12px 14px',
                  justifyContent: isTablet ? 'center' : 'flex-start',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  background: active ?
                  isDark ? 'rgba(203,187,160,0.1)' : 'rgba(203,187,160,0.15)' :
                  'transparent',
                  border: active ?
                  isDark ? '1px solid rgba(203,187,160,0.2)' : '1px solid rgba(203,187,160,0.3)' :
                  '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}>
                
                <Icon
                  style={{
                    width: '18px',
                    height: '18px',
                    color: active ?
                    '#E5D3B3' :
                    isDark ? 'rgba(255,255,255,0.3)' : 'rgba(60,50,40,0.4)',
                    flexShrink: 0
                  }}
                  strokeWidth={active ? 2 : 1.5} />
                
                {!isTablet &&
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: active ? 500 : 400,
                  letterSpacing: '0.04em',
                  color: active ?
                  '#E5D3B3' :
                  isDark ? 'rgba(255,255,255,0.45)' : 'rgba(60,50,40,0.55)'
                }}>
                    {lang === 'th' ? labelTh : labelEn}
                  </span>
                }
              </Link>);

          })}

          {/* Self Booking link */}
          <Link
            to="/quickbooking"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: isTablet ? '14px 0' : '14px 14px',
              justifyContent: isTablet ? 'center' : 'flex-start',
              borderRadius: '14px',
              textDecoration: 'none',
              marginTop: '8px',
              background: isActive('/quickbooking') ?
              isDark ? 'rgba(203,187,160,0.12)' : 'rgba(203,187,160,0.18)' :
              isDark ? 'rgba(203,187,160,0.05)' : 'rgba(203,187,160,0.08)',
              border: isDark ? '1px solid rgba(203,187,160,0.18)' : '1px solid rgba(203,187,160,0.28)',
              transition: 'all 0.2s ease'
            }} className="--color-mint-500: oklch(0.72 0.11 178);\n\n">
            
            <span style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: isTablet ? '18px' : '16px',
              fontWeight: 600,
              color: '#E5D3B3',
              lineHeight: 1
            }}>
              M
            </span>
            {!isTablet &&
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              color: '#E5D3B3'
            }}>
                Self Booking
              </span>
            }
          </Link>
        </nav>

        {/* Bottom controls */}
        <div
          style={{
            padding: isTablet ? '16px 0 28px' : '16px 12px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: isTablet ? 'center' : 'flex-start',
            borderTop: isDark ?
            '1px solid rgba(203,187,160,0.07)' :
            '1px solid rgba(203,187,160,0.2)'
          }}>
          
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            style={{
              display: 'flex',
              gap: '4px',
              padding: '8px 12px',
              borderRadius: '10px',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(60,50,40,0.15)',
              background: 'transparent',
              cursor: 'pointer'
            }}>
            
            {['TH', 'EN'].map((l, i) =>
            <span
              key={l}
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: lang === l.toLowerCase() ?
                '#E5D3B3' :
                isDark ? 'rgba(255,255,255,0.25)' : 'rgba(60,50,40,0.3)'
              }}>
              
                {l}{i === 0 && <span style={{ color: 'rgba(255,255,255,0.15)', margin: '0 3px' }}>|</span>}
              </span>
            )}
          </button>

          {/* About / Contact links */}
          <div style={{ display: 'flex', gap: '12px', paddingLeft: isTablet ? 0 : '4px', justifyContent: isTablet ? 'center' : 'flex-start' }}>
            <Link to="/about" style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'lowercase', color: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(60,50,40,0.3)', textDecoration: 'none' }}>about</Link>
            <Link to="/contact" style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'lowercase', color: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(60,50,40,0.3)', textDecoration: 'none' }}>contact</Link>
          </div>

          {/* View mode button */}
          <button
            onClick={() => setShowSelector(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '10px',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(60,50,40,0.15)',
              background: 'transparent',
              cursor: 'pointer',
              color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(60,50,40,0.45)'
            }}>
            
            <ViewIcon style={{ width: '13px', height: '13px' }} />
            {!isTablet &&
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '10px',
              letterSpacing: '0.1em',
              textTransform: 'lowercase'
            }}>
                {viewMode} view
              </span>
            }
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', position: 'relative' }}>
        <Outlet />
      </main>

      {/* View Mode Selector Modal */}
      <AnimatePresence>
        {showSelector &&
        <ViewModeSelector onClose={() => setShowSelector(false)} />
        }
      </AnimatePresence>
    </div>);

}