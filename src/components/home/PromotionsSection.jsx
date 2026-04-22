import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/LanguageContext';

export default function PromotionsSection({ promotions, isLoading }) {
  const { lang } = useLang();

  // Build display items — DB data first, fallback card always shown if none
  const items = promotions && promotions.length > 0
    ? promotions
    : [{
        id: 'soft-open',
        title_th: 'Soft Opening 15 May',
        title_en: 'Soft Opening 15 May',
        subtitle_th: 'By Invitation Only',
        subtitle_en: 'By Invitation Only',
        body_th: 'Mille dubis pationar sapa',
        body_en: 'Mille dubis pationar sapa',
      }];

  return (
    <div className="px-4 space-y-2.5">
      {isLoading ? (
        <div
          className="w-full h-36 rounded-[20px] animate-pulse"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        />
      ) : items.map((promo, i) => {
        const title = lang === 'th' ? promo.title_th : promo.title_en;
        const subtitle = lang === 'th'
          ? (promo.subtitle_th || promo.description_th || '')
          : (promo.subtitle_en || promo.description_en || '');
        const body = lang === 'th'
          ? (promo.body_th || '')
          : (promo.body_en || '');

        return (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full py-8 px-6 text-center"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px',
            }}
          >
            <p
              className="text-[26px] font-normal leading-tight"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: '#C9A84C',
                letterSpacing: '0.01em',
              }}
            >
              {title}
            </p>
            {subtitle && (
              <p
                className="mt-2 text-[19px] font-light"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  color: 'rgba(201,168,76,0.75)',
                }}
              >
                {subtitle}
              </p>
            )}
            {body && (
              <p
                className="mt-2 text-[14px] tracking-wide"
                style={{ color: 'rgba(198,200,204,0.4)', fontFamily: 'Montserrat, sans-serif' }}
              >
                {body}
              </p>
            )}
            {promo.code && (
              <span
                className="inline-block mt-3 px-3 py-1 text-[13px] tracking-[0.2em] uppercase rounded-full"
                style={{
                  border: '1px solid rgba(201,168,76,0.35)',
                  color: 'rgba(201,168,76,0.75)',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                {promo.code}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}