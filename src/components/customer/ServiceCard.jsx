import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import { Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function ServiceCard({ service, index = 0 }) {
  const { lang, t } = useLang();
  const name = lang === 'th' ? service.name_th : service.name_en;
  const desc = lang === 'th' ? service.description_th : service.description_en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/book?serviceId=${service.id}`}
        className="block group"
      >
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-sm transition-all active:scale-[0.98]">
          {/* Image */}
          {service.image_url && (
            <div className="relative h-40 overflow-hidden">
              <img
                src={service.image_url}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {service.is_popular && (
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary/90 text-primary-foreground text-[10px] font-semibold rounded-full uppercase tracking-wider">
                  {t('popular')}
                </span>
              )}
              {service.original_price && service.original_price > service.price && (
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-destructive/90 text-white text-[10px] font-semibold rounded-full">
                  -{Math.round((1 - service.price / service.original_price) * 100)}%
                </span>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-foreground text-sm leading-snug">
              {name}
            </h3>
            {desc && (
              <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                {desc}
              </p>
            )}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs">{service.duration_minutes} {t('minutes')}</span>
              </div>
              <div className="text-right">
                {service.original_price && service.original_price > service.price && (
                  <span className="text-[10px] text-muted-foreground line-through mr-1.5">
                    ฿{service.original_price.toLocaleString()}
                  </span>
                )}
                <span className="text-sm font-bold text-primary">
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