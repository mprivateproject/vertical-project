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
      {/* Ambient radial gradient background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(198,200,204,0.04) 0%, rgba(14,15,17,0) 60%)',
      }} />

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