import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';

export default function LanguageToggle() {
  const { lang, toggleLang } = useLang();

  return (
    <button
      onClick={toggleLang}
      className="relative flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary/80 backdrop-blur-sm text-xs font-medium transition-all active:scale-95"
    >
      <motion.span
        animate={{ opacity: lang === 'th' ? 1 : 0.4 }}
        className="text-secondary-foreground"
      >
        TH
      </motion.span>
      <span className="text-muted-foreground">/</span>
      <motion.span
        animate={{ opacity: lang === 'en' ? 1 : 0.4 }}
        className="text-secondary-foreground"
      >
        EN
      </motion.span>
    </button>
  );
}