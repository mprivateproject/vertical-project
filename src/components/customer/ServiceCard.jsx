import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function ServiceCard({ service, index = 0 }) {
  const { lang, t } = useLang();
  const name = lang === 'th' ? service.name_th : service.name_en;
  const desc = lang === 'th' ? service.description_th : service.description_en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
    >
      <Link to={`/book?serviceId=${service.id}`} className="block group">
        <div className="overflow-hidden rounded-xl bg-card border border-border/60 active:scale-[0.98] transition-transform duration-150">
          {/* Image */}
          {service.image_url && (
            <div className="relative h-36 overflow-hidden">
              <img
                src={service.image_url}
                alt={name}
                className="w-full h-full object-cover group-active:scale-[1.02] transition-transform duration-500"
              />
              {service.original_price && service.original_price > service.price && (
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/75 text-white text-[10px] font-medium rounded tracking-wider">
                  -{Math.round((1 - service.price / service.original_price) * 100)}%
                </span>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-foreground text-[13px] leading-snug tracking-tight">
              {name}
            </h3>

            <div className="flex items-end justify-between pt-0.5">
              <span className="text-muted-foreground text-[11px] tracking-wide">
                {service.duration_minutes} {t('minutes')}
              </span>
              <div className="text-right">
                {service.original_price && service.original_price > service.price && (
                  <span className="text-[10px] text-muted-foreground/60 line-through block leading-none mb-0.5">
                    ฿{service.original_price.toLocaleString()}
                  </span>
                )}
                <span className="text-sm font-bold text-foreground tracking-tight">
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