import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const SERVICE_IMAGES = {
  massage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80',
  facial: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&q=80',
  body_treatment: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=400&q=80',
  package: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&q=80',
  wellness: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80',
};

export default function ServicesSection({ services = [], isLoading }) {
  const { lang } = useLang();

  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-4">
        <p
          className="text-[10px] font-semibold tracking-[0.3em] uppercase"
          style={{ color: 'rgba(198,200,204,0.35)', fontFamily: 'Montserrat, sans-serif' }}
        >
          {lang === 'th' ? 'บริการ' : 'Services'}
        </p>
        <Link
          to="/services"
          className="text-[9px] tracking-[0.2em] uppercase"
          style={{ color: 'rgba(198,200,204,0.35)', fontFamily: 'Montserrat, sans-serif' }}
        >
          {lang === 'th' ? 'ดูทั้งหมด' : 'See all'}
        </Link>
      </div>

      <div className="overflow-x-auto -mx-5 px-5" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
          {isLoading
            ? [1, 2, 3].map(i => (
                <Skeleton key={i} className="w-36 h-48 rounded-[20px] flex-shrink-0" />
              ))
            : services.slice(0, 8).map((svc, i) => {
                const name = lang === 'th' ? svc.name_th : svc.name_en;
                const image = svc.image_url || SERVICE_IMAGES[svc.category] || SERVICE_IMAGES.massage;

                return (
                  <motion.div
                    key={svc.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-36 h-48 flex-shrink-0 overflow-hidden"
                    style={{ borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                  >
                    <img
                      src={image}
                      alt={name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.8) 100%)' }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p
                        className="text-white text-[12px] font-semibold leading-tight"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {name}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'rgba(201,168,76,0.8)' }}>
                        ฿{svc.price?.toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </div>
  );
}