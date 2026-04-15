import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';

const categories = ['all', 'massage', 'facial', 'body_treatment', 'package', 'wellness'];

export default function CategoryFilter({ selected, onSelect }) {
  const { t } = useLang();

  return (
    <div className="overflow-x-auto -mx-6 px-6" style={{ scrollbarWidth: 'none' }}>
      <div className="flex gap-2 pb-0.5" style={{ width: 'max-content' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`relative px-4 py-1.5 rounded-full text-[12px] font-medium tracking-wide transition-all duration-200 active:scale-95 whitespace-nowrap border ${
              selected === cat
                ? 'bg-foreground text-background border-foreground'
                : 'bg-transparent text-muted-foreground border-border hover:border-foreground/30'
            }`}
          >
            {t(cat)}
          </button>
        ))}
      </div>
    </div>
  );
}