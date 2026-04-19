import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

const FALLBACK_PROMOS = [
  {
    id: 'soft-open',
    title_th: 'Soft Opening',
    title_en: 'Soft Opening',
    subtitle_th: '15 พฤษภาคม นี้',
    subtitle_en: '15 May 2025',
    badge: 'By Invitation Only',
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&q=80',
  },
];

export default function PromotionsSection({ promotions, isLoading }) {
  const { lang } = useLang();

  const items = promotions && promotions.length > 0 ? promotions : FALLBACK_PROMOS;

  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-4">
        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase"
          style={{ color: 'rgba(198,200,204,0.35)', fontFamily: 'Montserrat, sans-serif' }}
        >
          {lang === 'th' ? 'โปรโมชั่น' : 'Promotions'}
        </p>
      </div>

      <div className="overflow-x-auto -mx-5 px-5" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
          {isLoading
            ? [1, 2].map(i => (
                <Skeleton key={i} className="w-64 h-40 rounded-[20px] flex-shrink-0" />
              ))
            : items.map((promo, i) => {
                const title = lang === 'th' ? promo.title_th : promo.title_en;
                const subtitle = lang === 'th'
                  ? (promo.subtitle_th || promo.description_th)
                  : (promo.subtitle_en || promo.description_en);
                const image = promo.image || promo.image_url || 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&q=80';

                return (
                  <motion.div
                    key={promo.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-64 h-40 flex-shrink-0 overflow-hidden"
                    style={{ borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.55)' }}
                  >
                    {/* Image */}
                    <img
                      src={image}
                      alt={title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Gradient overlay */}
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 100%)' }}
                    />
                    {/* Badge */}
                    {promo.badge && (
                      <div className="absolute top-3 right-3">
                        <span
                          className="text-[8px] tracking-[0.2em] uppercase px-2 py-1 rounded-full"
                          style={{
                            background: 'rgba(0,0,0,0.55)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: 'rgba(255,255,255,0.7)',
                            fontFamily: 'Montserrat, sans-serif',
                          }}
                        >
                          {promo.badge}
                        </span>
                      </div>
                    )}
                    {/* Promo code badge */}
                    {promo.code && (
                      <div className="absolute top-3 right-3">
                        <span
                          className="text-[8px] tracking-[0.2em] uppercase px-2 py-1 rounded-full"
                          style={{
                            background: 'rgba(0,0,0,0.55)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            border: '1px solid rgba(201,168,76,0.4)',
                            color: 'rgba(201,168,76,0.9)',
                            fontFamily: 'Montserrat, sans-serif',
                          }}
                        >
                          {promo.code}
                        </span>
                      </div>
                    )}
                    {/* Text */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p
                        className="text-white font-semibold text-[14px] leading-tight"
                        style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.01em' }}
                      >
                        {title}
                      </p>
                      {subtitle && (
                        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(198,200,204,0.6)' }}>
                          {subtitle}
                        </p>
                      )}
                      {/* Decorative line */}
                      <div
                        className="mt-2 w-8 h-[1px]"
                        style={{ background: 'rgba(201,168,76,0.5)' }}
                      />
                    </div>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </div>
  );
}