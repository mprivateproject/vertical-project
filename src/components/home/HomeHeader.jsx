import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import LanguageToggle from '@/components/shared/LanguageToggle';

const E = [0.22, 1, 0.36, 1];

export default function HomeHeader() {
  const { lang } = useLang();
  const { lineProfile, isLoggedIn } = useLine();

  const name = isLoggedIn && lineProfile?.displayName
    ? lineProfile.displayName
    : (lang === 'th' ? 'สวัสดี' : 'Hello');

  return (
    <div className="relative pt-14 pb-6 px-5">
      {/* Top-right language toggle */}
      <div className="absolute top-14 right-5">
        <LanguageToggle />
      </div>

      {/* Centered big greeting */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: E }}
        className="text-center"
      >
        <h1
          className="text-5xl font-normal"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            color: '#C9A84C',
            letterSpacing: '0.01em',
          }}
        >
          {name}
        </h1>
        {/* Subtle divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.35, duration: 0.6, ease: E }}
          className="mx-auto mt-3"
          style={{
            width: '48px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)',
          }}
        />
      </motion.div>
    </div>
  );
}