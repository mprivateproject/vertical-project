import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function PromotionBanner({ promotions = [] }) {
  const { lang } = useLang();
  
  if (!promotions.length) return null;

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-5 px-5">
      <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
        {promotions.map((promo, i) => {
          const title = lang === 'th' ? promo.title_th : promo.title_en;
          const desc = lang === 'th' ? promo.description_th : promo.description_en;
          
          return (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="w-72 flex-shrink-0 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/30 to-secondary p-4 border border-primary/10"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground truncate">{title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{desc}</p>
                  {promo.code && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md tracking-wider">
                      {promo.code}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}