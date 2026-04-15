import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';

const categories = ['all', 'massage', 'facial', 'body_treatment', 'package', 'wellness'];

export default function CategoryFilter({ selected, onSelect }) {
  const { t } = useLang();

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-5 px-5">
      <div className="flex gap-2 pb-1" style={{ width: 'max-content' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`relative px-4 py-2 rounded-full text-xs font-medium transition-all active:scale-95 whitespace-nowrap ${
              selected === cat
                ? 'text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {selected === cat && (
              <motion.div
                layoutId="category-pill"
                className="absolute inset-0 bg-primary rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{t(cat)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}