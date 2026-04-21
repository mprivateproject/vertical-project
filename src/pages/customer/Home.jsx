import React from 'react';
import { motion } from 'framer-motion';

const E = [0.22, 1, 0.36, 1];

export default function Home() {
  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: '100dvh', background: '#080604' }}>

      {/* ── Background photo ── */}
      <img
        src="https://media.base44.com/images/public/69df58a04843389be3df3f2e/99865a990_ChatGPTImageApr19202605_04_53PM.png"
        alt="Spa"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.52, filter: 'blur(0.4px) saturate(0.85)' }}
      />

      {/* ── Cinematic gradient overlay ── */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(5,4,3,0.72) 0%, rgba(5,4,3,0.08) 32%, rgba(5,4,3,0.12) 62%, rgba(5,4,3,0.88) 100%)',
      }} />

      {/* ── Film grain SVG overlay ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.055, mixBlendMode: 'overlay' }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* ── Vignette ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.55) 100%)',
      }} />

      {/* ── Depth of field top blur band ── */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{
        height: '18%',
        background: 'linear-gradient(180deg, rgba(5,4,3,0.45) 0%, transparent 100%)',
        backdropFilter: 'blur(1.5px)',
        WebkitBackdropFilter: 'blur(1.5px)',
        maskImage: 'linear-gradient(180deg, black 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(180deg, black 0%, transparent 100%)',
      }} />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col" style={{ minHeight: '100dvh', paddingBottom: '100px' }}>

        {/* ═══ LOGO AREA ═══ */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: E }}
          className="flex flex-col items-center"
          style={{ paddingTop: '56px' }}
        >
          {/* M monogram */}
          <p style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: '38px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: '#E5D3B3',
            lineHeight: 1,
            textShadow: '0 0 28px rgba(229,211,179,0.18)',
          }}>
            M
          </p>

          {/* Brand name */}
          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '7px',
            fontWeight: 500,
            letterSpacing: '0.42em',
            color: 'rgba(229,211,179,0.55)',
            textTransform: 'uppercase',
            marginTop: '7px',
            paddingLeft: '0.42em',
          }}>
            M Private Project
          </p>

          {/* Thin vertical line */}
          <div style={{
            width: '1px',
            height: '32px',
            marginTop: '14px',
            background: 'linear-gradient(180deg, rgba(229,211,179,0.28) 0%, transparent 100%)',
          }} />
        </motion.div>

        {/* ═══ HEADLINE ═══ */}
        <div
          className="flex flex-col items-center justify-center flex-1"
          style={{ paddingLeft: '24px', paddingRight: '24px', marginTop: '-28px' }}
        >
          {/* SOFT */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.85, ease: E }}
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 'clamp(26px, 9vw, 46px)',
              fontWeight: 300,
              letterSpacing: '0.52em',
              color: 'rgba(255,255,255,0.82)',
              lineHeight: 1,
              textTransform: 'uppercase',
              paddingLeft: '0.52em',
              textShadow: '0 2px 24px rgba(0,0,0,0.5)',
            }}
          >
            Soft
          </motion.p>

          {/* Opening */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.85, ease: E }}
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 'clamp(72px, 23vw, 130px)',
              fontWeight: 500,
              fontStyle: 'italic',
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              lineHeight: 0.88,
              marginTop: '-2px',
              textShadow: '0 4px 40px rgba(0,0,0,0.55), 0 0 60px rgba(229,211,179,0.07)',
            }}
          >
            Opening
          </motion.p>

          {/* Diamond divider */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.55, ease: E }}
            style={{ margin: '20px 0 16px', display: 'flex', alignItems: 'center', gap: '10px' }}
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
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '8px',
              fontWeight: 500,
              letterSpacing: '0.38em',
              color: '#CBBBA0',
              textTransform: 'uppercase',
              paddingLeft: '0.38em',
              marginBottom: '20px',
            }}
          >
            Invitations Only
          </motion.p>

          {/* Footer info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.72, duration: 0.9 }}
            className="flex flex-col items-center"
            style={{ gap: '5px' }}
          >
            <p style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '7px',
              fontWeight: 400,
              letterSpacing: '0.32em',
              color: 'rgba(255,255,255,0.38)',
              textTransform: 'uppercase',
              paddingLeft: '0.32em',
            }}>
              Nonthaburi
            </p>
            <p style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '7px',
              fontWeight: 400,
              letterSpacing: '0.26em',
              color: 'rgba(255,255,255,0.28)',
              textTransform: 'uppercase',
              paddingLeft: '0.26em',
            }}>
              LINE : @mprivateproject
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}