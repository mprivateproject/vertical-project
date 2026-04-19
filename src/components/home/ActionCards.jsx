import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, CalendarDays, MapPin, Tag } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

const E = [0.22, 1, 0.36, 1];

const GOOGLE_MAPS_URL = 'https://maps.google.com';

export default function ActionCards({ totalBookings = 0 }) {
  const { lang } = useLang();

  const cards = [
    {
      icon: BookOpen,
      title: lang === 'th' ? 'จองด่วน' : 'To Book',
      subtitle: lang === 'th' ? 'นัดหมายใหม่' : 'Create booking',
      to: '/quickbooking',
      gradient: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
      iconBg: 'rgba(255,255,255,0.07)',
      iconColor: 'rgba(255,255,255,0.75)',
    },
    {
      icon: CalendarDays,
      title: lang === 'th' ? 'กิจกรรม' : 'Activity',
      subtitle: `${lang === 'th' ? 'การจองทั้งหมด' : 'Total bookings'}: ${totalBookings}`,
      to: '/bookings',
      gradient: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
      iconBg: 'rgba(255,255,255,0.07)',
      iconColor: 'rgba(255,255,255,0.75)',
    },
    {
      icon: MapPin,
      title: lang === 'th' ? 'แผนที่' : 'Maps & Directions',
      subtitle: lang === 'th' ? 'ดูใน Google Maps' : 'See us on Google Maps',
      href: GOOGLE_MAPS_URL,
      gradient: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
      iconBg: 'rgba(255,255,255,0.07)',
      iconColor: 'rgba(255,255,255,0.75)',
    },
    {
      icon: Tag,
      title: lang === 'th' ? 'ข่าวและโปรโมชั่น' : 'News & Promotions',
      subtitle: lang === 'th' ? 'ดีลพิเศษสำหรับคุณ' : 'Exclusive deals for you',
      to: '/promotions',
      gradient: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
      iconBg: 'rgba(255,255,255,0.07)',
      iconColor: 'rgba(255,255,255,0.75)',
    },
  ];

  return (
    <div className="px-5">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          const inner = (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.07, duration: 0.5, ease: E }}
              whileTap={{ scale: 0.96 }}
              className="p-4 flex flex-col gap-3"
              style={{
                background: card.gradient,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
                minHeight: '108px',
              }}
            >
              {/* Icon */}
              <div
                className="w-9 h-9 flex items-center justify-center rounded-[10px]"
                style={{ background: card.iconBg, border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Icon className="w-4 h-4" style={{ color: card.iconColor }} />
              </div>
              {/* Text */}
              <div>
                <p
                  className="text-[13px] font-semibold leading-tight"
                  style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Montserrat, sans-serif' }}
                >
                  {card.title}
                </p>
                <p
                  className="text-[10px] mt-0.5 leading-tight"
                  style={{ color: 'rgba(198,200,204,0.4)' }}
                >
                  {card.subtitle}
                </p>
              </div>
            </motion.div>
          );

          if (card.href) {
            return (
              <a key={i} href={card.href} target="_blank" rel="noopener noreferrer">
                {inner}
              </a>
            );
          }
          return (
            <Link key={i} to={card.to}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}