import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/LanguageContext';

const E = [0.22, 1, 0.36, 1];

const GOOGLE_MAPS_URL = 'https://maps.google.com';

// Spa background images for cards
const BG_IMAGES = [
  'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=500&q=75',
  null,
  null,
  null,
];

export default function ActionCards({ totalBookings = 0 }) {
  const { lang } = useLang();

  const cards = [
    {
      label: lang === 'th' ? 'จองด่วน' : 'To Book',
      to: '/quickbooking',
      image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=500&q=70',
    },
    {
      label: lang === 'th' ? 'แผนที่' : 'Maps and Directions',
      href: GOOGLE_MAPS_URL,
      image: null,
    },
    {
      label: lang === 'th' ? 'กิจกรรม' : 'Activity',
      to: '/bookings',
      image: null,
    },
    {
      label: lang === 'th' ? 'ข่าวและโปรโมชั่น' : 'News and Promotion',
      to: '/promotions',
      image: null,
    },
  ];

  const cardStyle = (image) => ({
    background: image
      ? 'transparent'
      : 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '18px',
    overflow: 'hidden',
    position: 'relative',
  });

  const renderCard = (card, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + i * 0.07, duration: 0.5, ease: E }}
      whileTap={{ scale: 0.96 }}
      style={{ ...cardStyle(card.image), aspectRatio: '1 / 1' }}
    >
      {/* Background image */}
      {card.image && (
        <>
          <img
            src={card.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.45 }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(14,16,20,0.2) 0%, rgba(14,16,20,0.55) 100%)' }}
          />
        </>
      )}

      {/* Label top-left */}
      <div className="absolute top-0 left-0 p-3.5">
        <p
          className="text-[13px] font-light leading-tight"
          style={{
            color: card.image ? 'rgba(201,168,76,0.95)' : 'rgba(201,168,76,0.75)',
            fontFamily: 'Georgia, "Times New Roman", serif',
            letterSpacing: '0.01em',
          }}
        >
          {card.label}
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="px-4">
      <div className="grid grid-cols-2 gap-2.5">
        {cards.map((card, i) => {
          const inner = renderCard(card, i);
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