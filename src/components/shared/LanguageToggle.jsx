import React from 'react';
import { useLang } from '@/lib/LanguageContext';

export default function LanguageToggle() {
  const { lang, toggleLang } = useLang();

  return (
    <button
      onClick={toggleLang}
      className="flex items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm overflow-hidden"
      style={{ padding: '3px' }}
    >
      <span
        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide transition-all duration-200 ${
          lang === 'th'
            ? 'bg-white text-black'
            : 'text-white/60'
        }`}
      >
        TH
      </span>
      <span
        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide transition-all duration-200 ${
          lang === 'en'
            ? 'bg-white text-black'
            : 'text-white/60'
        }`}
      >
        EN
      </span>
    </button>
  );
}