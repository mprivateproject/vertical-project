import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import HeroSection from '@/components/customer/HeroSection';
import QuickBooking from '@/components/customer/QuickBooking';
import LineLoginButton from '@/components/customer/LineLoginButton';
import { useLine } from '@/lib/LineContext';

export default function Home() {
  const { t } = useLang();
  const { isLoggedIn } = useLine();

  return (
    <div className="min-h-screen" style={{ background: '#0E0F11' }}>
      {/* Ambient radial gradient */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(198,200,204,0.05) 0%, rgba(14,15,17,0) 65%)',
      }} />
      {/* Noise grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      <div className="relative z-10">
        <HeroSection />

        <div className="px-5 pt-8 pb-36 space-y-8">

          {/* LINE Login prompt */}
          {!isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <LineLoginButton />
            </motion.div>
          )}

          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5 }}
          >
            <p className="text-[9px] font-semibold tracking-[0.35em] uppercase mb-6" style={{ color: 'rgba(198,200,204,0.35)', fontFamily: 'Montserrat, sans-serif' }}>
              — {t('bookNow')} —
            </p>
            <QuickBooking />
          </motion.div>

        </div>
      </div>
    </div>
  );
}