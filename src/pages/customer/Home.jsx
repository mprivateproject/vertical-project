import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor } from 'lucide-react';
import ViewModeSelector from '@/components/shared/ViewModeSelector';
import { useLang } from '@/lib/LanguageContext';

const E = [0.25, 1, 0.35, 1];

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

const LINE_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.477 2 2 6.084 2 11.111c0 4.52 3.663 8.306 8.615 9.012.335.072.791.22.906.506.104.26.068.668.033.931l-.146.88c-.045.26-.206 1.016.89.554 1.096-.462 5.913-3.482 8.07-5.963C21.636 15.318 22 13.27 22 11.111 22 6.084 17.523 2 12 2z" fill="rgba(0,195,0,0.85)" />
    <path d="M9.5 9H8.25a.25.25 0 0 0-.25.25v4.5c0 .138.112.25.25.25H9.5a.25.25 0 0 0 .25-.25v-4.5A.25.25 0 0 0 9.5 9zM15.75 9H14.5a.25.25 0 0 0-.25.25v2.673L12.427 9.11A.25.25 0 0 0 12.22 9H11a.25.25 0 0 0-.25.25v4.5c0 .138.112.25.25.25h1.25a.25.25 0 0 0 .25-.25v-2.672l1.827 2.816a.25.25 0 0 0 .207.106h1.216a.25.25 0 0 0 .25-.25v-4.5A.25.25 0 0 0 15.75 9z" fill="white" />
  </svg>
);

export default function Home() {
  const [showSelector, setShowSelector] = useState(false);
  const { lang } = useLang();
  const cd = useCountdown(OPENING_TS);
  const isTh = lang === 'th';

  const units = cd.d > 0
    ? [
        { v: pad(cd.d), l: isTh ? 'วัน' : 'day' },
        { v: pad(cd.h), l: isTh ? 'ชั่วโมง' : 'hr' },
        { v: pad(cd.m), l: isTh ? 'นาที' : 'min' },
        { v: pad(cd.s), l: isTh ? 'วินาที' : 'sec' },
      ]
    : [
        { v: pad(cd.h), l: isTh ? 'ชั่วโมง' : 'hr' },
        { v: pad(cd.m), l: isTh ? 'นาที' : 'min' },
        { v: pad(cd.s), l: isTh ? 'วินาที' : 'sec' },
      ];

  return (
    <div className="relative w-full" style={{ minHeight: '100dvh', background: '#04030200' }}>

      {/* Image */}
      <img
        src="https://media.base44.com/images/public/69df58a04843389be3df3f2e/99865a990_ChatGPTImageApr19202605_04_53PM.png"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.38, filter: 'saturate(0.7)' }}
        alt=""
      />

      {/* Single clean overlay — dark at poles, clear in the middle */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, #050403 0%, rgba(5,4,3,0.25) 35%, rgba(5,4,3,0.35) 65%, #050403 100%)',
      }} />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col"
        style={{ minHeight: '100dvh', padding: '52px 32px 44px' }}
      >

        {/* ── Logo ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: E }}
          className="flex flex-col items-center"
        >
          <p style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 'clamp(38px, 9vw, 56px)',
            fontWeight: 500,
            letterSpacing: '0.12em',
            color: '#D6C4A6',
            lineHeight: 1,
          }}>
            M
          </p>
          <p style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 'clamp(6px, 1.3vw, 8px)',
            fontWeight: 300,
            letterSpacing: '0.6em',
            color: 'rgba(214,196,166,0.38)',
            textTransform: 'uppercase',
            marginTop: '8px',
          }}>
            Private Project
          </p>
        </motion.div>

        {/* ── Center block ── */}
        <div className="flex flex-col items-center justify-center flex-1">

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: E }}
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(7px, 1.4vw, 9px)',
              fontWeight: 300,
              letterSpacing: '0.52em',
              color: 'rgba(214,196,166,0.4)',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            {isTh ? 'เปิดทำการ' : 'Grand Opening'}
          </motion.p>

          {/* Hero date */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1.1, ease: E }}
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 'clamp(72px, 18vw, 128px)',
              fontWeight: 400,
              fontStyle: 'italic',
              letterSpacing: '-0.01em',
              color: '#ffffff',
              lineHeight: 0.9,
            }}
          >
            14 May
          </motion.p>

          {/* Hairline */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: E }}
            style={{
              width: '32px',
              height: '1px',
              background: 'rgba(214,196,166,0.25)',
              margin: '24px 0',
            }}
          />

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1.0 }}
          >
            {cd.done ? (
              <p style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 'clamp(8px, 1.6vw, 10px)',
                fontWeight: 300,
                letterSpacing: '0.5em',
                color: 'rgba(214,196,166,0.55)',
                textTransform: 'uppercase',
              }}>
                {isTh ? 'เปิดแล้ววันนี้' : 'Open Today'}
              </p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'clamp(12px, 4vw, 28px)' }}>
                {units.map(({ v, l }, i) => (
                  <React.Fragment key={l}>
                    {i > 0 && (
                      <span style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: 'clamp(14px, 3vw, 20px)',
                        fontWeight: 200,
                        color: 'rgba(255,255,255,0.12)',
                        lineHeight: 1,
                        marginBottom: '2px',
                      }}>:</span>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontFamily: '"Cormorant Garamond", Georgia, serif',
                        fontSize: 'clamp(36px, 9vw, 56px)',
                        fontWeight: 300,
                        letterSpacing: '0.04em',
                        color: '#E8D8BC',
                        lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {v}
                      </span>
                      <span style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: 'clamp(6px, 1.3vw, 8px)',
                        fontWeight: 300,
                        letterSpacing: '0.4em',
                        color: 'rgba(232,216,188,0.28)',
                        textTransform: 'uppercase',
                      }}>
                        {l}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </motion.div>

          {/* Invitation tag */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 1.0 }}
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(6px, 1.3vw, 8px)',
              fontWeight: 300,
              letterSpacing: '0.52em',
              color: 'rgba(255,255,255,0.2)',
              textTransform: 'uppercase',
              marginTop: '28px',
            }}
          >
            {isTh ? 'เฉพาะผู้รับเชิญ' : 'Invitations Only'}
          </motion.p>
        </div>

        {/* ── Footer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 1.0 }}
          className="flex flex-col items-center"
          style={{ gap: '14px' }}
        >
          {/* Location */}
          <p style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 'clamp(6px, 1.3vw, 8px)',
            fontWeight: 300,
            letterSpacing: '0.45em',
            color: 'rgba(255,255,255,0.18)',
            textTransform: 'uppercase',
          }}>
            Nonthaburi
          </p>

          {/* Action row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* LINE */}
            <a
              href="https://lin.ee/qEHrpx0"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 16px',
                borderRadius: '2px',
                border: '1px solid rgba(255,255,255,0.1)',
                textDecoration: 'none',
              }}
            >
              {LINE_ICON}
              <span style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 'clamp(7px, 1.4vw, 9px)',
                fontWeight: 300,
                letterSpacing: '0.18em',
                color: 'rgba(255,255,255,0.32)',
              }}>
                @mprivateproject
              </span>
            </a>

            {/* Divider dot */}
            <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

            {/* Directions */}
            <a
              href="https://maps.app.goo.gl/T6STh82nTi6ku78c6"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '2px',
                border: '1px solid rgba(255,255,255,0.1)',
                textDecoration: 'none',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.32)" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <span style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 'clamp(7px, 1.4vw, 9px)',
                fontWeight: 300,
                letterSpacing: '0.18em',
                color: 'rgba(255,255,255,0.32)',
              }}>
                {isTh ? 'แผนที่' : 'Directions'}
              </span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* View mode toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        onClick={() => setShowSelector(true)}
        aria-label="Change view mode"
        style={{
          position: 'fixed',
          top: '18px',
          right: '18px',
          zIndex: 50,
          width: '32px',
          height: '32px',
          borderRadius: '2px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Monitor style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.3)' }} />
      </motion.button>

      <AnimatePresence>
        {showSelector && <ViewModeSelector onClose={() => setShowSelector(false)} />}
      </AnimatePresence>
    </div>
  );
}
