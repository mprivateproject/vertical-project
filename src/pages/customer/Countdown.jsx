import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useLang } from '@/lib/LanguageContext';

const E = [0.22, 1, 0.36, 1];

function pad(n) {
  return String(Math.max(0, n)).padStart(2, '0');
}

function parseTarget(searchParams) {
  const raw = searchParams.get('to') || searchParams.get('date');
  if (raw) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 30);
  fallback.setHours(0, 0, 0, 0);
  return fallback;
}

function useRemaining(target) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    const diff = target.getTime() - now;
    if (diff <= 0) {
      return { totalMs: diff, days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { totalMs: diff, days, hours, minutes, seconds, done: false };
  }, [target, now]);
}

const BG_IMAGE =
  'https://media.base44.com/images/public/69df58a04843389be3df3f2e/99865a990_ChatGPTImageApr19202605_04_53PM.png';

export default function Countdown() {
  const [searchParams] = useSearchParams();
  const { t } = useLang();
  const target = useMemo(() => parseTarget(searchParams), [searchParams]);
  const title = (searchParams.get('title') || 'Coming soon').trim() || 'Coming soon';
  const remaining = useRemaining(target);
  const celebrated = useRef(false);

  useEffect(() => {
    if (!remaining.done || celebrated.current) return;
    celebrated.current = true;
    const end = Date.now() + 2800;
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#E5D3B3', '#C6A87D', '#ffffff'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#E5D3B3', '#C6A87D', '#ffffff'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [remaining.done]);

  const units = [
    { label: 'Days', value: remaining.days, format: (v, done) => (done ? '0' : String(v)) },
    { label: 'Hours', value: remaining.hours, format: (v, done) => (done ? '00' : pad(v)) },
    { label: 'Min', value: remaining.minutes, format: (v, done) => (done ? '00' : pad(v)) },
    { label: 'Sec', value: remaining.seconds, format: (v, done) => (done ? '00' : pad(v)) },
  ];

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: '100dvh', background: '#080604' }}>
      <img
        src={BG_IMAGE}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.45, filter: 'blur(0.4px) saturate(0.85)' }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(5,4,3,0.78) 0%, rgba(5,4,3,0.2) 40%, rgba(5,4,3,0.9) 100%)',
        }}
      />
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.055, mixBlendMode: 'overlay' }}>
        <filter id="countdown-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#countdown-grain)" />
      </svg>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      <div
        className="relative z-10 flex flex-col items-center px-5"
        style={{ minHeight: '100dvh', paddingTop: '56px', paddingBottom: '112px' }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: E }}
          className="text-center max-w-md"
        >
          <p
            style={{
              fontFamily: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
              fontSize: '13px',
              letterSpacing: '0.35em',
              color: 'rgba(229,211,179,0.45)',
              textTransform: 'uppercase',
            }}
          >
            M
          </p>
          <h1
            className="mt-4"
            style={{
              fontFamily: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
              fontSize: 'clamp(26px, 7vw, 36px)',
              fontWeight: 600,
              letterSpacing: '0.02em',
              color: '#E5D3B3',
              lineHeight: 1.2,
              textShadow: '0 0 32px rgba(229,211,179,0.18)',
            }}
          >
            {title}
          </h1>
          <p
            className="mt-3 text-[12px] leading-relaxed"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              color: 'rgba(229,211,179,0.42)',
            }}
          >
            {remaining.done
              ? t('countdownComplete')
              : target.toLocaleString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.12, ease: E }}
          className="mt-10 w-full max-w-md grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3"
        >
          {units.map((u, i) => (
            <motion.div
              key={u.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 * i, ease: E }}
              className="rounded-2xl px-3 py-5 text-center"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(229,211,179,0.12)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
              }}
            >
              <p
                className="tabular-nums"
                style={{
                  fontFamily: '"SF Mono", ui-monospace, monospace',
                  fontSize: 'clamp(28px, 9vw, 36px)',
                  fontWeight: 500,
                  color: '#F5EFE6',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {u.format(u.value, remaining.done)}
              </p>
              <p
                className="mt-2 text-[10px] uppercase tracking-[0.22em]"
                style={{
                  fontFamily: 'Montserrat, Inter, sans-serif',
                  color: 'rgba(229,211,179,0.42)',
                }}
              >
                {u.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-12"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full px-7 py-3 text-[11px] uppercase tracking-[0.2em] transition-transform active:scale-95"
            style={{
              fontFamily: 'Montserrat, Inter, sans-serif',
              color: 'rgba(8,6,4,0.92)',
              background: 'linear-gradient(135deg, #E5D3B3 0%, #C6A87D 100%)',
              boxShadow: '0 8px 28px rgba(198,168,125,0.28)',
            }}
          >
            {t('backToHome')}
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
