import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';

const categories = ['all', 'massage', 'facial', 'body_treatment', 'package', 'wellness'];

export default function CategoryFilter({ selected, onSelect }) {
  const { t } = useLang();

  return (
    <div className="overflow-x-auto -mx-6 px-6" style={{ scrollbarWidth: 'none' }}>
      <div className="flex gap-3 pb-1" style={{ width: 'max-content' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`px-4 py-1.5 text-xs font-light tracking-widest transition-all duration-200 active:scale-95 whitespace-nowrap border ${
              selected === cat
                ? 'bg-foreground text-background border-foreground'
                : 'bg-transparent text-muted-foreground border-border'
            }`}
          >
            {t(cat).toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}