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
        <div className="overflow-hidden rounded-sm bg-card border border-border active:opacity-80 transition-opacity duration-150">
          {/* Image */}
          {service.image_url && (
            <div className="relative h-40 overflow-hidden bg-muted">
              <img
                src={service.image_url}
                alt={name}
                className="w-full h-full object-cover group-hover:opacity-95 transition-opacity duration-300"
              />
              {service.original_price && service.original_price > service.price && (
                <span className="absolute top-3 right-3 px-2 py-0.5 bg-foreground text-background text-[10px] font-medium">
                  -{Math.round((1 - service.price / service.original_price) * 100)}%
                </span>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-5 space-y-3">
            <h3 className="font-display text-sm font-light text-foreground leading-snug">
              {name}
            </h3>

            <div className="flex items-end justify-between pt-1">
              <span className="text-xs text-muted-foreground tracking-wide">
                {service.duration_minutes} min
              </span>
              <div className="text-right">
                {service.original_price && service.original_price > service.price && (
                  <span className="text-[11px] text-muted-foreground/50 line-through block leading-none mb-1">
                    ฿{service.original_price.toLocaleString()}
                  </span>
                )}
                <span className="text-base font-light text-foreground">
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