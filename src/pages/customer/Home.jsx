import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor } from 'lucide-react';
import ViewModeSelector from '@/components/shared/ViewModeSelector';
import { useLang } from '@/lib/LanguageContext';

const E = [0.22, 1, 0.36, 1];
const BG    = '#0A0907';
const GOLD  = '#C9B89A';
const WHITE = '#F5F0E8';

export default function Home() {
  const [showSelector, setShowSelector] = useState(false);
  const { lang } = useLang();

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        background: BG,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Watermark M */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: '-6vw',
          top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 'clamp(320px, 72vw, 560px)',
          fontWeight: 700,
          color: WHITE,
          opacity: 0.028,
          lineHeight: 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        M
      </div>

      {/* ── Top bar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: E }}
        style={{
          padding: '36px 36px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '9px',
            letterSpacing: '0.45em',
            color: GOLD,
            textTransform: 'uppercase',
            opacity: 0.65,
          }}
        >
          M Private Project
        </span>
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '9px',
            letterSpacing: '0.3em',
            color: GOLD,
            textTransform: 'uppercase',
            opacity: 0.3,
          }}
        >
          Nonthaburi
        </span>
      </motion.div>

      {/* ── Centre content ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 36px',
        }}
      >
        {/* Top rule */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.9, ease: E }}
          style={{
            height: '1px',
            background: `linear-gradient(to right, ${GOLD}, transparent)`,
            opacity: 0.3,
            transformOrigin: 'left',
            marginBottom: '24px',
          }}
        />

        {/* Opens label */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: E }}
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '9px',
            letterSpacing: '0.55em',
            color: GOLD,
            textTransform: 'uppercase',
            opacity: 0.75,
            marginBottom: '12px',
          }}
        >
          Opens
        </motion.p>

        {/* 14 */}
        <motion.p
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.9, ease: E }}
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 'clamp(110px, 28vw, 200px)',
            fontWeight: 700,
            color: WHITE,
            lineHeight: 0.88,
            letterSpacing: '-0.03em',
            margin: 0,
          }}
        >
          14
        </motion.p>

        {/* May */}
        <motion.p
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.9, ease: E }}
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 'clamp(110px, 28vw, 200px)',
            fontWeight: 700,
            fontStyle: 'italic',
            color: WHITE,
            lineHeight: 0.88,
            letterSpacing: '-0.03em',
            margin: 0,
            opacity: 0.82,
          }}
        >
          May
        </motion.p>

        {/* Bottom rule */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.9, ease: E }}
          style={{
            height: '1px',
            background: `linear-gradient(to right, ${GOLD}, transparent)`,
            opacity: 0.3,
            transformOrigin: 'left',
            margin: '28px 0 22px',
          }}
        />

        {/* Invitations only */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '9px',
            letterSpacing: '0.5em',
            color: GOLD,
            textTransform: 'uppercase',
            opacity: 0.5,
          }}
        >
          Invitations Only
        </motion.p>
      </div>

      {/* ── Bottom info bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.05, duration: 0.8 }}
        style={{
          padding: '0 36px',
          paddingBottom: 'calc(128px + env(safe-area-inset-bottom))',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <a
          href="https://lin.ee/qEHrpx0"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '9px',
              letterSpacing: '0.35em',
              color: WHITE,
              textTransform: 'uppercase',
              opacity: 0.28,
            }}
          >
            Line
          </span>
        </a>

        <span style={{ color: GOLD, opacity: 0.2, fontSize: '10px' }}>·</span>

        <a
          href="https://maps.app.goo.gl/T6STh82nTi6ku78c6"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '9px',
              letterSpacing: '0.35em',
              color: WHITE,
              textTransform: 'uppercase',
              opacity: 0.28,
            }}
          >
            {lang === 'th' ? 'แผนที่' : 'Directions'}
          </span>
        </a>
      </motion.div>

      {/* ── View mode toggle ── */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        onClick={() => setShowSelector(true)}
        aria-label="Change view mode"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 50,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(201,184,154,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Monitor style={{ width: '14px', height: '14px', color: 'rgba(201,184,154,0.55)' }} />
      </motion.button>

      <AnimatePresence>
        {showSelector && (
          <ViewModeSelector onClose={() => setShowSelector(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
