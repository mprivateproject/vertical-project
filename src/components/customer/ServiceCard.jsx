import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

export default function ServiceCard({ service, index = 0 }) {
  const { lang, t } = useLang();
  const name = lang === 'th' ? service.name_th : service.name_en;
  const hasDiscount = service.original_price && service.original_price > service.price;
  const discountPct = hasDiscount ? Math.round((1 - service.price / service.original_price) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/book?serviceId=${service.id}`} className="block group">
        <div
          className="overflow-hidden rounded-2xl active:scale-[0.97] transition-transform duration-150"
          style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          }}
        >
          {/* Image */}
          <div className="relative h-36 overflow-hidden bg-black/20">
            {service.image_url ? (
              <img
                src={service.image_url}
                alt={name}
                className="w-full h-full object-cover group-active:scale-[1.04] transition-transform duration-700"
                style={{ opacity: 0.82 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' }}>
                <span style={{ color: 'rgba(255,255,255,0.08)', fontSize: 32 }}>✦</span>
              </div>
            )}

            {/* Gradient overlay on image */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 100%)' }}
            />

            {/* Discount badge */}
            {hasDiscount && (
              <span
                className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-semibold rounded-full tracking-wider"
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(8px)',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                -{discountPct}%
              </span>
            )}

            {/* Popular badge */}
            {service.is_popular && (
              <span
                className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[9px] font-semibold rounded-full tracking-widest uppercase"
                style={{
                  background: 'rgba(201,168,76,0.25)',
                  border: '1px solid rgba(201,168,76,0.4)',
                  color: 'rgba(240,208,128,0.9)',
                  backdropFilter: 'blur(8px)',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                ✦ Popular
              </span>
            )}
          </div>

          {/* Content */}
          <div className="px-3.5 py-3 space-y-2">
            <h3
              className="text-[13px] font-light leading-snug"
              style={{
                color: 'rgba(255,255,255,0.88)',
                fontFamily: 'Georgia, "Times New Roman", serif',
                letterSpacing: '0.01em',
              }}
            >
              {name}
            </h3>

            <div className="flex items-end justify-between">
              <div className="flex items-center gap-1" style={{ color: 'rgba(161,165,173,0.45)' }}>
                <Clock className="w-3 h-3" />
                <span className="text-[10px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {service.duration_minutes} {t('minutes')}
                </span>
              </div>

              <div className="text-right">
                {hasDiscount && (
                  <span
                    className="text-[10px] line-through block leading-none mb-0.5"
                    style={{ color: 'rgba(161,165,173,0.3)' }}
                  >
                    ฿{service.original_price.toLocaleString()}
                  </span>
                )}
                <span
                  className="text-[14px] font-semibold tabular-nums"
                  style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Montserrat, sans-serif' }}
                >
                  ฿{service.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}