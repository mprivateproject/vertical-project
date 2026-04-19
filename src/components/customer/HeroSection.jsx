import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import LanguageToggle from '../shared/LanguageToggle';
import { motion } from 'framer-motion';

const easing = [0.22, 1, 0.36, 1];

export default function HeroSection() {
  const { t } = useLang();
  const { lineProfile, isLoggedIn } = useLine();

  return (
    <div className="relative overflow-hidden" style={{ height: '72vw', maxHeight: '340px', minHeight: '260px' }}>
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://media.base44.com/images/public/69df58a04843389be3df3f2e/1839da3f1_IMG_7982.png"
          alt="Spa"
          className="w-full h-full object-cover"
          style={{ filter: 'blur(4px)', transform: 'scale(1.05)' }}
        />
        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(14,15,17,0.55) 0%, rgba(14,15,17,0.1) 40%, rgba(14,15,17,0.85) 100%)',
        }} />
        {/* Radial subtle highlight */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 70%)',
        }} />
      </div>

      {/* Header controls */}
      <div className="pt-12 pb-4 px-6 relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isLoggedIn && lineProfile?.pictureUrl && (
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: easing }}
              src={lineProfile.pictureUrl}
              alt=""
              className="w-7 h-7 rounded-full"
              style={{ border: '1px solid rgba(255,255,255,0.2)' }}
            />
          )}
        </div>
        <LanguageToggle />
      </div>

      {/* Hero content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: easing }}
        >
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-[9px] font-semibold tracking-[0.35em] uppercase mb-2"
            style={{ color: 'rgba(198,200,204,0.5)', fontFamily: 'Montserrat, sans-serif' }}
          >
            Wellness Spa
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: easing }}
            className="font-display text-3xl font-bold text-white tracking-tight leading-tight"
            style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '-0.01em' }}
          >
            {t('brand')}
          </motion.h1>
          {isLoggedIn && lineProfile?.displayName && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[11px] mt-2 font-light tracking-[0.2em] uppercase"
              style={{ color: 'rgba(198,200,204,0.4)' }}
            >
              {t('welcome')}, {lineProfile.displayName}
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
}