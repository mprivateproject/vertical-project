import React from 'react';
import { motion } from 'framer-motion';

const E = [0.22, 1, 0.36, 1];

export default function Home() {
  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: '100dvh', background: '#0d0b09' }}>
      {/* Background spa photo */}
      <img
        src="https://media.base44.com/images/public/69df58a04843389be3df3f2e/99865a990_ChatGPTImageApr19202605_04_53PM.png"
        alt="Spa"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.55 }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(6,4,3,0.55) 0%, rgba(6,4,3,0.05) 35%, rgba(6,4,3,0.15) 58%, rgba(6,4,3,0.82) 100%)',
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col"
        style={{ minHeight: '100dvh', paddingBottom: '100px' }}
      >
        {/* ── TOP: Logo + Brand ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: E }}
          className="flex flex-col items-center"
          style={{ paddingTop: '52px' }}
        >
          {/* M monogram */}
          <p style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: '32px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.88)',
            lineHeight: 1,
            letterSpacing: '0.04em',
            marginBottom: '6px',
          }}>
            M
          </p>
          {/* Brand name */}
          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '7.5px',
            letterSpacing: '0.42em',
            color: 'rgba(255,255,255,0.42)',
            textTransform: 'uppercase',
          }}>
            M Private Project
          </p>
          {/* Vertical line */}
          <div style={{
            width: '1px',
            height: '36px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)',
            marginTop: '12px',
          }} />
        </motion.div>

        {/* ── CENTER: SOFT Opening ── */}
        <div
          className="flex flex-col items-center justify-center flex-1"
          style={{ paddingLeft: '20px', paddingRight: '20px', marginTop: '-24px' }}
        >
          {/* SOFT */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.7, ease: E }}
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 'clamp(30px, 10vw, 52px)',
              fontWeight: 300,
              letterSpacing: '0.45em',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1,
              textTransform: 'uppercase',
              paddingLeft: '0.45em', // compensate for letter-spacing
            }}
          >
            Soft
          </motion.p>

          {/* Opening italic */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.7, ease: E }}
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 'clamp(68px, 22vw, 120px)',
              fontWeight: 500,
              fontStyle: 'italic',
              letterSpacing: '-0.015em',
              color: 'rgba(255,255,255,0.97)',
              lineHeight: 0.9,
              marginTop: '-2px',
            }}
          >
            Opening
          </motion.p>

          {/* Diamond divider */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.42, duration: 0.5, ease: E }}
            style={{ margin: '18px 0 14px' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="5.657" y="0.343" width="8" height="8" rx="0.5" transform="rotate(45 5.657 0.343)" fill="rgba(210,185,130,0.55)" />
            </svg>
          </motion.div>

          {/* INVITATIONS ONLY */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '8px',
              letterSpacing: '0.35em',
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            Invitations Only
          </motion.p>

          {/* Location & LINE */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.58, duration: 0.8 }}
            className="flex items-center gap-3"
          >
            {/* dot */}
            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
            <p style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '7.5px',
              letterSpacing: '0.28em',
              color: 'rgba(255,255,255,0.32)',
              textTransform: 'uppercase',
            }}>
              Nonthaburi
            </p>
            <div style={{ width: '1px', height: '9px', background: 'rgba(255,255,255,0.15)' }} />
            <p style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '7.5px',
              letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.28)',
              textTransform: 'uppercase',
            }}>
              LINE · @mprivateproject
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}