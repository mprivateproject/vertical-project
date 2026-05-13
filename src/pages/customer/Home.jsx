import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor } from 'lucide-react';
import ViewModeSelector from '@/components/shared/ViewModeSelector';
import { useLang } from '@/lib/LanguageContext';

const E = [0.22, 1, 0.36, 1];

// Target: 14 May 2026 midnight, Bangkok (UTC+7)
const OPENING_TS = new Date('2026-05-14T00:00:00+07:00').getTime();

function useCountdown(target) {
  const calc = () => {
    const diff = target - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      done: false,
    };
  };
  const [state, setState] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setState(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);
  return state;
}

function pad(n) { return String(n).padStart(2, '0'); }

function CountUnit({ value, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', minWidth: '48px' }}>
      <span style={{
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        fontSize: 'clamp(40px, 10vw, 62px)',
        fontWeight: 400,
        letterSpacing: '0.02em',
        color: '#E5D3B3',
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
        textShadow: '0 0 30px rgba(229,211,179,0.25)',
      }}>
        {value}
      </span>
      <span style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 'clamp(7px, 1.5vw, 9px)',
        fontWeight: 300,
        letterSpacing: '0.36em',
        color: 'rgba(229,211,179,0.32)',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
    </div>
  );
}

export default function Home() {
  const [showSelector, setShowSelector] = useState(false);
  const { lang } = useLang();
  const countdown = useCountdown(OPENING_TS);

  const isTh = lang === 'th';

  return (
    <div className="relative w-full" style={{ minHeight: '100dvh', background: '#050403' }}>

      {/* ── Background image ── */}
      <img
        src="https://media.base44.com/images/public/69df58a04843389be3df3f2e/99865a990_ChatGPTImageApr19202605_04_53PM.png"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.42, filter: 'blur(0.6px) saturate(0.78)' }}
        alt=""
      />

      {/* ── Top + bottom gradient ── */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(5,4,3,0.90) 0%, rgba(5,4,3,0.12) 28%, rgba(5,4,3,0.15) 60%, rgba(5,4,3,0.96) 100%)',
      }} />

      {/* ── Side vignette ── */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(90deg, rgba(5,4,3,0.55) 0%, transparent 28%, transparent 72%, rgba(5,4,3,0.55) 100%)',
      }} />

      {/* ── Radial vignette ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 70% at 50% 42%, transparent 38%, rgba(0,0,0,0.62) 100%)',
      }} />

      {/* ── Film grain ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.038, mixBlendMode: 'overlay' }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.74" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* ── Main content ── */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{ minHeight: '100dvh' }}
      >

        {/* ═══ LOGO ZONE ═══ */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, ease: E }}
          className="flex flex-col items-center"
          style={{ paddingTop: '54px' }}
        >
          {/* Monogram */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              inset: '-24px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(229,211,179,0.14) 0%, transparent 72%)',
              filter: 'blur(10px)',
            }} />
            <p style={{
              position: 'relative',
              fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
              fontSize: 'clamp(44px, 10vw, 64px)',
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: '#E5D3B3',
              lineHeight: 1,
              textShadow: '0 0 48px rgba(229,211,179,0.38), 0 0 100px rgba(229,211,179,0.1)',
            }}>
              M
            </p>
          </div>

          <p style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 'clamp(7px, 1.5vw, 9px)',
            fontWeight: 300,
            letterSpacing: '0.55em',
            color: 'rgba(229,211,179,0.38)',
            textTransform: 'uppercase',
            marginTop: '10px',
          }}>
            Private Project
          </p>

          <div style={{
            marginTop: '18px',
            width: '72px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(229,211,179,0.28), transparent)',
          }} />
        </motion.div>

        {/* ═══ CENTER ZONE ═══ */}
        <div
          className="flex flex-col items-center justify-center flex-1 px-6 w-full"
          style={{ paddingTop: '8px', paddingBottom: '8px' }}
        >
          {/* "Invitations Only" pill badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.28, duration: 0.75, ease: E }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 18px',
              borderRadius: '100px',
              border: '1px solid rgba(229,211,179,0.18)',
              background: 'rgba(229,211,179,0.055)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              marginBottom: '26px',
            }}
          >
            <span style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: 'rgba(229,211,179,0.65)',
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(7px, 1.5vw, 9px)',
              fontWeight: 400,
              letterSpacing: '0.4em',
              color: 'rgba(229,211,179,0.6)',
              textTransform: 'uppercase',
            }}>
              {isTh ? 'เฉพาะผู้รับเชิญ' : 'Invitations Only'}
            </span>
          </motion.div>

          {/* Pre-header label */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.9, ease: E }}
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 'clamp(11px, 2.5vw, 15px)',
              fontWeight: 300,
              letterSpacing: '0.5em',
              color: 'rgba(229,211,179,0.42)',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            {isTh ? 'เปิดทำการ' : 'Grand Opening'}
          </motion.p>

          {/* Date — main hero text */}
          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1.0, ease: E }}
            style={{
              fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
              fontSize: 'clamp(70px, 17vw, 122px)',
              fontWeight: 500,
              fontStyle: 'italic',
              letterSpacing: '0.02em',
              color: '#FFFFFF',
              lineHeight: 0.88,
              textShadow: '0 4px 52px rgba(0,0,0,0.55), 0 0 90px rgba(229,211,179,0.07)',
            }}
          >
            14 May
          </motion.p>

          {/* Ornamental divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.52, duration: 0.65, ease: E }}
            style={{ margin: '22px 0 20px', display: 'flex', alignItems: 'center', gap: '14px' }}
          >
            <div style={{ width: '44px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(203,187,160,0.35))' }} />
            <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
              <rect x="3.182" y="0.318" width="4.5" height="4.5" rx="0.25" transform="rotate(45 3.182 0.318)" fill="rgba(203,187,160,0.5)" />
            </svg>
            <div style={{ width: '44px', height: '1px', background: 'linear-gradient(90deg, rgba(203,187,160,0.35), transparent)' }} />
          </motion.div>

          {/* Countdown timer */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, duration: 0.85, ease: E }}
          >
            {countdown.done ? (
              <p style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 'clamp(9px, 2vw, 12px)',
                fontWeight: 400,
                letterSpacing: '0.4em',
                color: 'rgba(229,211,179,0.65)',
                textTransform: 'uppercase',
                marginBottom: '28px',
              }}>
                {isTh ? 'เปิดแล้ววันนี้' : 'Open Today'}
              </p>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 'clamp(10px, 3.5vw, 22px)',
                marginBottom: '32px',
              }}>
                {countdown.d > 0 && (
                  <>
                    <CountUnit value={pad(countdown.d)} label={isTh ? 'วัน' : 'day'} />
                    <span style={{
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      fontSize: 'clamp(28px, 6vw, 42px)',
                      color: 'rgba(229,211,179,0.18)',
                      lineHeight: 1,
                      paddingBottom: '14px',
                    }}>:</span>
                  </>
                )}
                <CountUnit value={pad(countdown.h)} label={isTh ? 'ชั่วโมง' : 'hrs'} />
                <span style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: 'clamp(28px, 6vw, 42px)',
                  color: 'rgba(229,211,179,0.18)',
                  lineHeight: 1,
                  paddingBottom: '14px',
                }}>:</span>
                <CountUnit value={pad(countdown.m)} label={isTh ? 'นาที' : 'min'} />
                <span style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: 'clamp(28px, 6vw, 42px)',
                  color: 'rgba(229,211,179,0.18)',
                  lineHeight: 1,
                  paddingBottom: '14px',
                }}>:</span>
                <CountUnit value={pad(countdown.s)} label={isTh ? 'วินาที' : 'sec'} />
              </div>
            )}
          </motion.div>

          {/* ── Contact row ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.76, duration: 0.9 }}
            className="flex flex-col items-center"
            style={{ gap: '10px' }}
          >
            {/* Location */}
            <p style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(7px, 1.5vw, 9px)',
              fontWeight: 300,
              letterSpacing: '0.38em',
              color: 'rgba(255,255,255,0.25)',
              textTransform: 'uppercase',
            }}>
              Nonthaburi
            </p>

            {/* LINE button */}
            <a
              href="https://lin.ee/qEHrpx0"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 20px',
                borderRadius: '100px',
                border: '1px solid rgba(255,255,255,0.09)',
                background: 'rgba(255,255,255,0.035)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                textDecoration: 'none',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.477 2 2 6.084 2 11.111c0 4.52 3.663 8.306 8.615 9.012.335.072.791.22.906.506.104.26.068.668.033.931l-.146.88c-.045.26-.206 1.016.89.554 1.096-.462 5.913-3.482 8.07-5.963C21.636 15.318 22 13.27 22 11.111 22 6.084 17.523 2 12 2z" fill="rgba(0,195,0,0.8)" />
                <path d="M9.5 9H8.25a.25.25 0 0 0-.25.25v4.5c0 .138.112.25.25.25H9.5a.25.25 0 0 0 .25-.25v-4.5A.25.25 0 0 0 9.5 9zM15.75 9H14.5a.25.25 0 0 0-.25.25v2.673L12.427 9.11A.25.25 0 0 0 12.22 9H11a.25.25 0 0 0-.25.25v4.5c0 .138.112.25.25.25h1.25a.25.25 0 0 0 .25-.25v-2.672l1.827 2.816a.25.25 0 0 0 .207.106h1.216a.25.25 0 0 0 .25-.25v-4.5A.25.25 0 0 0 15.75 9z" fill="white" />
              </svg>
              <span style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 'clamp(8px, 1.6vw, 10px)',
                fontWeight: 300,
                letterSpacing: '0.2em',
                color: 'rgba(255,255,255,0.38)',
              }}>
                @mprivateproject
              </span>
            </a>
          </motion.div>
        </div>

        {/* ═══ BOTTOM ZONE — Directions ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.9 }}
          style={{ paddingBottom: '48px' }}
        >
          <a
            href="https://maps.app.goo.gl/T6STh82nTi6ku78c6"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '9px',
              textDecoration: 'none',
            }}
          >
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'rgba(203,187,160,0.06)',
              border: '1px solid rgba(203,187,160,0.16)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="rgba(203,187,160,0.65)" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </div>
            <span style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(7px, 1.4vw, 9px)',
              fontWeight: 300,
              letterSpacing: '0.3em',
              color: 'rgba(203,187,160,0.38)',
              textTransform: 'lowercase',
            }}>
              {isTh ? 'แผนที่การเดินทาง' : 'get directions'}
            </span>
          </a>
        </motion.div>
      </div>

      {/* ── View mode toggle ── */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        onClick={() => setShowSelector(true)}
        aria-label="Change view mode"
        style={{
          position: 'fixed',
          top: '18px',
          right: '18px',
          zIndex: 50,
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.055)',
          border: '1px solid rgba(203,187,160,0.16)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Monitor style={{ width: '13px', height: '13px', color: 'rgba(203,187,160,0.5)' }} />
      </motion.button>

      <AnimatePresence>
        {showSelector && <ViewModeSelector onClose={() => setShowSelector(false)} />}
      </AnimatePresence>
    </div>
  );
}
