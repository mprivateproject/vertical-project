import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import LanguageToggle from '../shared/LanguageToggle';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const { t } = useLang();
  const { lineProfile, isLoggedIn } = useLine();

  return (
    <div className="relative overflow-hidden" style={{ height: '72vw', maxHeight: '340px', minHeight: '260px' }}>
      {/* Background image */}
      <div className="absolute inset-0">
        <img src="https://media.base44.com/images/public/69df58a04843389be3df3f2e/1839da3f1_IMG_7982.png"
        alt="Spa" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />
      </div>

      {/* Header controls */}
      <div className="pt-12 pb-4 px-6 opacity-95 relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isLoggedIn && lineProfile?.pictureUrl &&
          <img
            src={lineProfile.pictureUrl}
            alt=""
            className="w-7 h-7 rounded-full border border-white/25 opacity-90" />

          }
        </div>
        <LanguageToggle />
      </div>

      {/* Hero content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}>
          
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-2" style={{color: '#c9a84c'}}>
            Wellness Spa
          </p>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight leading-tight" style={{fontFamily: 'Montserrat, sans-serif', letterSpacing: '-0.01em'}}>
            {t('brand')}
          </h1>
          {isLoggedIn && lineProfile?.displayName &&
          <p className="text-white/50 text-[12px] mt-2 font-light tracking-widest uppercase">
              {t('welcome')}, {lineProfile.displayName}
            </p>
          }
        </motion.div>
      </div>
    </div>);

}