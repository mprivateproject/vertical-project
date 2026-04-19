import React from 'react';
import { useLocation } from 'react-router-dom';
import { useLang } from '@/lib/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const BG_IMAGE = 'https://media.base44.com/images/public/69df58a04843389be3df3f2e/99865a990_ChatGPTImageApr19202605_04_53PM.png';

export default function PageHeader() {
  const { pathname } = useLocation();
  const { lang, toggleLang } = useLang();
  const { isDark, toggleTheme } = useTheme();

  // Only show on non-home pages
  if (pathname === '/') return null;

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: '120px' }}
    >
      {/* Spa background image */}
      <img
        src={BG_IMAGE}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ opacity: 0.45, transform: 'scale(1.05)' }}
      />
      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(14,15,17,0.5) 0%, rgba(14,15,17,0.2) 40%, rgba(14,15,17,0.95) 100%)',
        }}
      />
      {/* Warm chandelier glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.08) 0%, transparent 65%)',
        }}
      />

      {/* Top-right controls */}
      <div className="absolute top-3 right-4 z-20 flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {isDark
            ? <Sun className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.8)' }} />
            : <Moon className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.8)' }} />
          }
        </button>

        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="flex items-center gap-1 px-3 py-1 rounded-full transition-all active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <span
            className="text-[11px] font-semibold tracking-wider"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              color: lang === 'th' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)',
            }}
          >
            TH
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>|</span>
          <span
            className="text-[11px] font-semibold tracking-wider"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              color: lang === 'en' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)',
            }}
          >
            EN
          </span>
        </button>
      </div>
    </div>
  );
}