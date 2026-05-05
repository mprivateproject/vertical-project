import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';
import ViewModeSelector from '@/components/shared/ViewModeSelector';
import { useLang } from '@/lib/LanguageContext';

const E = [0.22, 1, 0.36, 1];

export default function Home() {
  const [showSelector, setShowSelector] = useState(false);
  const { lang } = useLang();

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ minHeight: '100dvh', background: '#080604' }}
    >
      {/* ── Background photo ── */}
      <img
        src="https://media.base44.com/images/public/69df58a04843389be3df3f2e/99865a990_ChatGPTImageApr19202605_04_53PM.png"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.52, filter: 'blur(0.4px) saturate(0.85)' }}
        alt=""
      />

      {/* ── Cinematic gradient overlay ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(5,4,3,0.72) 0%, rgba(5,4,3,0.08) 32%, rgba(5,4,3,0.12) 62%, rgba(5,4,3,0.88) 100%)',
        }}
      />

      {/* ── Film grain ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.055, mixBlendMode: 'overlay' }}
      >
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* ── Vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.55) 100%)' }}
      />

      {/* ── Content ── */}
      <div
        className="relative z-10 flex flex-col items-center justify-between"
        style={{ minHeight: '100dvh', paddingBottom: '60px' }}
      >
        {/* ═══ LOGO ═══ */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: E }}
          className="flex flex-col items-center"
          style={{ paddingTop: '56px' }}
        >
          <p
            style={{
              fontFamily: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
              fontSize: 'clamp(36px, 8vw, 52px)',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#E5D3B3',
              lineHeight: 1,
              textShadow: '0 0 28px rgba(229,211,179,0.22)',
            }}
          >
            M
          </p>
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(8px, 1.8vw, 10px)',
              fontWeight: 400,
              letterSpacing: '0.44em',
              color: 'rgba(229,211,179,0.5)',
              textTransform: 'uppercase',
              marginTop: '7px',
              paddingLeft: '0.44em',
            }}
          >
            {lang === 'th' ? 'M Private Project' : 'M Private Project'}
          </p>
          <div
            style={{
              width: '1px',
              height: '28px',
              marginTop: '14px',
              background: 'linear-gradient(180deg, rgba(229,211,179,0.28) 0%, transparent 100%)',
            }}
          />
        </motion.div>

        {/* ═══ HEADLINE ═══ */}
        <div className="flex flex-col items-center justify-center flex-1 px-6" style={{ marginTop: '8px' }}>
          {/* Open */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.85, ease: E }}
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(14px, 4vw, 24px)',
              fontWeight: 300,
              letterSpacing: '0.30em',
              color: 'rgba(255,255,255,0.78)',
              lineHeight: 1,
              textTransform: 'uppercase',
              paddingLeft: '0.55em',
              textShadow: '0 2px 24px rgba(0,0,0,0.5)',
            }}
          >
            Opens 14 May
          </motion.p>

          {/* Opens 14v May */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.85, ease: E }}
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(72px, 18vw, 130px)',
              fontWeight: 600,
              fontStyle: 'italic',
              letterSpacing: '0.04em',
              color: '#FFFFFF',
              lineHeight: 0.90,
              marginTop: '2px',
              textShadow: '0 4px 40px rgba(0,0,0,0.6), 0 0 60px rgba(229,211,179,0.09)',
            }}
          >
            Opening
          </motion.p>

          {/* Diamond divider */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.55, ease: E }}
            style={{ margin: '18px 0 14px', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <div style={{ width: '28px', height: '1px', background: 'rgba(203,187,160,0.3)' }} />
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <rect x="3.757" y="0.343" width="5" height="5" rx="0.3" transform="rotate(45 3.757 0.343)" fill="rgba(203,187,160,0.6)" />
            </svg>
            <div style={{ width: '28px', height: '1px', background: 'rgba(203,187,160,0.3)' }} />
          </motion.div>

          {/* INVITATIONS ONLY */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.9 }}
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(10px, 2vw, 12px)',
              fontWeight: 500,
              letterSpacing: '0.38em',
              color: '#CBBBA0',
              textTransform: 'lowercase',
              paddingLeft: '0.38em',
              marginBottom: '20px',
            }}
          >
            Invitations Only
          </motion.p>

          {/* Location + LINE */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.72, duration: 0.9 }}
            className="flex flex-col items-center"
            style={{ gap: '6px' }}
          >
            <p
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 'clamp(8px, 1.6vw, 10px)',
                fontWeight: 350,
                letterSpacing: '0.3em',
                color: 'rgba(255,255,255,0.38)',
                textTransform: 'lowercase',
                paddingLeft: '0.3em',
              }}
            >
              {lang === 'th' ? 'Nonthaburi' : 'Nonthaburi'}
            </p>
            <a
              href="https://lin.ee/qEHrpx0"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginTop: '2px', textDecoration: 'none' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.477 2 2 6.084 2 11.111c0 4.52 3.663 8.306 8.615 9.012.335.072.791.22.906.506.104.26.068.668.033.931l-.146.88c-.045.26-.206 1.016.89.554 1.096-.462 5.913-3.482 8.07-5.963C21.636 15.318 22 13.27 22 11.111 22 6.084 17.523 2 12 2z" fill="rgba(0,195,0,0.75)" />
                <path d="M9.5 9H8.25a.25.25 0 0 0-.25.25v4.5c0 .138.112.25.25.25H9.5a.25.25 0 0 0 .25-.25v-4.5A.25.25 0 0 0 9.5 9zM15.75 9H14.5a.25.25 0 0 0-.25.25v2.673L12.427 9.11A.25.25 0 0 0 12.22 9H11a.25.25 0 0 0-.25.25v4.5c0 .138.112.25.25.25h1.25a.25.25 0 0 0 .25-.25v-2.672l1.827 2.816a.25.25 0 0 0 .207.106h1.216a.25.25 0 0 0 .25-.25v-4.5A.25.25 0 0 0 15.75 9z" fill="white" />
              </svg>
              <span
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: 'clamp(8px, 1.6vw, 10px)',
                  fontWeight: 350,
                  letterSpacing: '0.24em',
                  color: 'rgba(255,255,255,0.38)',
                  textTransform: 'lowercase',
                }}
              >
                LINE : @mprivateproject
              </span>
            </a>
          </motion.div>

          {/* Map link */}
          <motion.a
            href="https://maps.app.goo.gl/T6STh82nTi6ku78c6"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.9 }}
            style={{
              marginTop: '20px',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(203,187,160,0.08)',
                border: '1px solid rgba(203,187,160,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(203,187,160,0.75)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 'clamp(8px, 1.6vw, 10px)',
                fontWeight: 350,
                letterSpacing: '0.28em',
                color: 'rgba(203,187,160,0.5)',
                textTransform: 'lowercase',
              }}
            >
              {lang === 'th' ? 'แผนที่การเดินทาง' : 'Get Directions'}
            </span>
          </motion.a>
        </div>
      </div>

      {/* View mode toggle button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        onClick={() => setShowSelector(true)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 50,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(203,187,160,0.2)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Monitor style={{ width: '14px', height: '14px', color: 'rgba(203,187,160,0.6)' }} />
      </motion.button>

      {/* View Mode Selector Modal */}
      <AnimatePresence>
        {showSelector && (
          <ViewModeSelector onClose={() => setShowSelector(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
