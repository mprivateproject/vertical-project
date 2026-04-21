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
        style={{ opacity: 0.45 }}
      />

      {/* Gradient overlay — heavier at top & bottom, lighter in middle */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(8,6,4,0.7) 0%, rgba(8,6,4,0.1) 38%, rgba(8,6,4,0.2) 60%, rgba(8,6,4,0.88) 100%)',
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center"
        style={{ minHeight: '100dvh', paddingBottom: '90px', paddingLeft: '24px', paddingRight: '24px' }}
      >

        {/* Brand top label */}
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: E }}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '8px',
            letterSpacing: '0.45em',
            color: 'rgba(255,255,255,0.35)',
            marginBottom: '52px',
            textTransform: 'uppercase',
          }}
        >
          M PRIVATE PROJECT
        </motion.p>

        {/* SOFT */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.7, ease: E }}
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 'clamp(38px, 13vw, 72px)',
            fontWeight: 300,
            letterSpacing: '0.38em',
            color: 'rgba(255,255,255,0.82)',
            lineHeight: 1,
            textTransform: 'uppercase',
          }}
        >
          Soft
        </motion.p>

        {/* OPENING */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.7, ease: E }}
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 'clamp(62px, 22vw, 130px)',
            fontWeight: 500,
            fontStyle: 'italic',
            letterSpacing: '-0.01em',
            color: 'rgba(255,255,255,0.95)',
            lineHeight: 0.92,
            marginTop: '-4px',
          }}
        >
          Opening
        </motion.p>

        {/* Thin gold divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7, ease: E }}
          style={{
            width: '40px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(210,185,130,0.6), transparent)',
            margin: '28px auto',
          }}
        />

        {/* Invitations only */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '9px',
            letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.55)',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}
        >
          Invitations Only
        </motion.p>

        {/* Location & LINE */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}
        >
          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '8px',
            letterSpacing: '0.25em',
            color: 'rgba(255,255,255,0.28)',
            textTransform: 'uppercase',
          }}>
            Nonthaburi
          </p>
          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '8px',
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.22)',
            textTransform: 'uppercase',
          }}>
            LINE · @mprivateproject
          </p>
        </motion.div>

      </div>
    </div>
  );
}