import React from 'react';
import { useLang } from '@/lib/LanguageContext';

const categories = ['all', 'massage', 'facial', 'body_treatment', 'package', 'wellness'];

export default function CategoryFilter({ selected, onSelect }) {
  const { t } = useLang();

  return (
    <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      <div className="flex gap-2 pb-0.5" style={{ width: 'max-content' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`relative px-4 py-2 rounded-full text-[13px] font-medium tracking-[0.06em] transition-all duration-200 active:scale-95 whitespace-nowrap border ${
              selected === cat
                ? 'bg-foreground text-background border-foreground shadow-lg'
                : 'bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground'
            }`}
          >
            {t(cat)}
          </button>
        ))}
      </div>
    </div>
  );
}