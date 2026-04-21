import React from 'react';
import { motion } from 'framer-motion';

const E = [0.22, 1, 0.36, 1];

export default function Home() {
  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: '100dvh', background: '#1a1410' }}>
      {/* Background spa photo */}
      <img
        src="https://media.base44.com/images/public/69df58a04843389be3df3f2e/99865a990_ChatGPTImageApr19202605_04_53PM.png"
        alt="Spa"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.55 }}
      />

      {/* Dark vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(10,8,6,0.35) 0%, rgba(10,8,6,0.15) 35%, rgba(10,8,6,0.55) 70%, rgba(10,8,6,0.85) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4" style={{ minHeight: '100dvh', paddingBottom: '80px' }}>

        {/* STAY TUNED label */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: E }}
          className="mb-4 px-5 py-1"
          style={{
            border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: '2px',
          }}
        >
          <p
            className="text-white text-[10px] tracking-[0.35em] font-light"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            STAY TUNED
          </p>
        </motion.div>

        {/* SOFT */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.55, ease: E }}
          className="text-white uppercase leading-none"
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 'clamp(48px, 17vw, 92px)',
            fontWeight: 300,
            letterSpacing: '0.18em',
            lineHeight: 0.95,
          }}
        >
          SOFT
        </motion.p>

        {/* OPEN — giant */}
        <motion.p
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.18, duration: 0.65, ease: E }}
          className="text-white uppercase leading-none"
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 'clamp(80px, 28vw, 152px)',
            fontWeight: 600,
            fontStyle: 'italic',
            letterSpacing: '0.04em',
            lineHeight: 0.88,
          }}
        >
          Opening
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.35, duration: 0.5, ease: E }}
          className="my-5 w-16"
          style={{ height: '1px', background: 'rgba(255,255,255,0.4)' }}
        />

        {/* INVITATIONS ONLY */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-white text-[14px] tracking-[0.3em] font-semibold uppercase"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          INVITATIONS ONLY
        </motion.p>

        {/* Location & LINE */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-2 space-y-0.5"
        >
          <p
            className="text-[10px] tracking-[0.25em] uppercase"
            style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Montserrat, sans-serif' }}
          >
            NONTHABURI
          </p>
          <p
            className="text-[10px] tracking-[0.2em] uppercase"
            style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Montserrat, sans-serif' }}
          >
            LINE: @MPRIVATEPROJECT
          </p>
        </motion.div>

      </div>
    </div>
  );
}