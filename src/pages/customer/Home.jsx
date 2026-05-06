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
      className="relative w-full"
      style={{ minHeight: '100dvh', background: '#080604' }}>
      
      {/* Background photo */}
      <img
        src="https://media.base44.com/images/public/69df58a04843389be3df3f2e/99865a990_ChatGPTImageApr19202605_04_53PM.png"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.52, filter: 'blur(0.4px) saturate(0.85)' }}
        alt="" />
      

      {/* Cinematic gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
          'linear-gradient(180deg, rgba(5,4,3,0.72) 0%, rgba(5,4,3,0.08) 32%, rgba(5,4,3,0.12) 62%, rgba(5,4,3,0.88) 100%)'
        }} />
      

      {/* Film grain */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.055, mixBlendMode: 'overlay' }}>
        
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.55) 100%)' }} />
      

      {/* Content */}
      

















































































































































































      

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
          cursor: 'pointer'
        }}>
        
        <Monitor style={{ width: '14px', height: '14px', color: 'rgba(203,187,160,0.6)' }} />
      </motion.button>

      {/* View Mode Selector Modal */}
      <AnimatePresence>
        {showSelector &&
        <ViewModeSelector onClose={() => setShowSelector(false)} />
        }
      </AnimatePresence>
    </div>);

}