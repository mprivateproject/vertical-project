import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
import { liffSyncClient } from '@/lib/liffSyncClient';
import { motion } from 'framer-motion';

const E = [0.22, 1, 0.36, 1];

const CATEGORY_ORDER = ['massage', 'facial', 'body_treatment', 'package', 'wellness'];

const CATEGORY_LABELS = {
  massage: { th: 'นวด', en: 'Massage' },
  facial: { th: 'ดูแลผิวหน้า', en: 'Facial' },
  body_treatment: { th: 'ทรีตเมนต์ผิวกาย', en: 'Body Treatment' },
  package: { th: 'แพ็คเกจ', en: 'Package' },
  wellness: { th: 'เวลเนส', en: 'Wellness' },
};

export default function Price() {
  const { lang } = useLang();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services-price'],
    queryFn: async () => {
      const r = await liffSyncClient.call({
        url: '/functions/liffSync',
        method: 'POST',
        data: { action: 'getServices' },
      });
      return r.services || [];
    },
  });

  // Group by category
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = services.filter(s => s.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div className="min-h-screen pb-36 pt-6 px-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: E }}
        className="mb-8"
      >
        <p className="text-[9px] font-semibold tracking-[0.35em] uppercase mb-1 text-muted-foreground"
          style={{ fontFamily: 'Montserrat, sans-serif' }}>
          — MENU & PRICING —
        </p>
        <h1 className="font-display text-2xl font-light tracking-wide text-foreground">
          {lang === 'th' ? 'เมนูและราคา' : 'Menu & Prices'}
        </h1>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, items], gi) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.08, duration: 0.5, ease: E }}
            >
              {/* Category header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[9px] font-semibold tracking-[0.3em] uppercase text-muted-foreground"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {CATEGORY_LABELS[cat]?.[lang] || cat}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Service rows */}
              <div className="space-y-2">
                {items.map((svc, i) => {
                  const name = lang === 'th' ? svc.name_th : svc.name_en;
                  const desc = lang === 'th' ? svc.description_th : svc.description_en;
                  return (
                    <motion.div
                      key={svc.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: gi * 0.08 + i * 0.05, duration: 0.4, ease: E }}
                      className="flex items-start justify-between gap-4 py-3 border-b border-border/40 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-foreground leading-snug">{name}</p>
                        {desc && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{desc}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1 tracking-wide">
                          {svc.duration_minutes} {lang === 'th' ? 'นาที' : 'min'}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {svc.original_price && svc.original_price > svc.price && (
                          <p className="text-[10px] text-muted-foreground line-through">
                            ฿{Number(svc.original_price).toLocaleString()}
                          </p>
                        )}
                        <p className="text-[15px] font-semibold text-foreground tabular-nums">
                          ฿{Number(svc.price).toLocaleString()}
                        </p>
                        {svc.is_popular && (
                          <span className="text-[8px] tracking-[0.15em] uppercase text-primary"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {lang === 'th' ? 'ยอดนิยม' : 'Popular'}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}