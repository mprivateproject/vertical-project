import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/LanguageContext';
import { Link } from 'react-router-dom';

const SERVICE_IMAGES = {
  massage: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&q=80',
  facial: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80',
  body_treatment: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
  package: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80',
  wellness: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80',
};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&q=80',
  'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80',
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
];

export default function ServicesSection({ services = [], isLoading }) {
  const { lang } = useLang();

  const label = lang === 'th' ? 'Harland sommer.' : 'Harland sommer.';

  // Use DB services or fallback placeholders
  const items = services.length > 0
    ? services.slice(0, 6)
    : FALLBACK_IMAGES.map((img, i) => ({ id: `fb-${i}`, image_url: img, name_th: '', name_en: '', category: null }));

  return (
    <div>
      {/* Small label above */}
      <p
        className="px-4 mb-3 text-[14px]"
        style={{ color: 'rgba(198,200,204,0.4)', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.05em' }}
      >
        {label}
      </p>

      {/* Horizontal scroll strip */}
      <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-2 px-4" style={{ width: 'max-content', paddingBottom: '4px' }}>
          {isLoading
            ? [1, 2, 3].map(i => (
                <div
                  key={i}
                  className="flex-shrink-0 animate-pulse"
                  style={{
                    width: '160px',
                    height: '200px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.04)',
                  }}
                />
              ))
            : items.map((svc, i) => {
                const name = lang === 'th' ? svc.name_th : svc.name_en;
                const image = svc.image_url || SERVICE_IMAGES[svc.category] || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];

                return (
                  <motion.div
                    key={svc.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex-shrink-0 relative overflow-hidden"
                    style={{
                      width: '160px',
                      height: '200px',
                      borderRadius: '16px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    }}
                  >
                    <img
                      src={image}
                      alt={name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {name && (
                      <>
                        <div
                          className="absolute inset-0"
                          style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.75) 100%)' }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p
                            className="text-white text-[15px] font-light"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            {name}
                          </p>
                          {svc.price && (
                            <p className="text-[13px] mt-0.5" style={{ color: 'rgba(201,168,76,0.8)' }}>
                              ฿{svc.price?.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
        </div>
      </div>
    </div>
  );
}