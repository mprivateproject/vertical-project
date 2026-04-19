import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const BG_IMAGE = 'https://media.base44.com/images/public/69df58a04843389be3df3f2e/99865a990_ChatGPTImageApr19202605_04_53PM.png';

export default function PageHeader() {
  const { pathname } = useLocation();

  // Only show on non-home pages
  if (pathname === '/') return null;

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: '140px' }}
    >
      {/* Spa background image */}
      <img
        src={BG_IMAGE}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ opacity: 0.45, transform: 'scale(1.05)' }}
      />
      {/* Dark gradient overlay — stronger at bottom to blend into page bg */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(14,15,17,0.45) 0%, rgba(14,15,17,0.2) 40%, rgba(14,15,17,0.95) 100%)',
        }}
      />
      {/* Subtle warm glow from chandelier area */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.08) 0%, transparent 65%)',
        }}
      />
    </div>
  );
}