import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import LanguageToggle from '../shared/LanguageToggle';
import ThemeToggle from '../shared/ThemeToggle';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const { t } = useLang();
  const { lineProfile, isLoggedIn } = useLine();

  return (
    <div className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80"
          alt="Spa"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-background" />
      </div>

      {/* Header controls */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-2">
          {isLoggedIn && lineProfile?.pictureUrl && (
            <img
              src={lineProfile.pictureUrl}
              alt=""
              className="w-8 h-8 rounded-full border-2 border-white/30"
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      {/* Hero content */}
      <div className="relative z-10 px-5 pb-10 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="font-display text-3xl font-semibold text-white tracking-tight">
            {t('brand')}
          </h1>
          <p className="text-white/70 text-sm mt-1.5 font-light">
            {t('tagline')}
          </p>
          {isLoggedIn && (
            <p className="text-white/80 text-sm mt-3">
              {t('welcome')}, {lineProfile?.displayName} 🙏
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}