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
    <div className="bg-background min-h-screen">
      <HeroSection />

      <div className="px-6 pt-12 pb-28 space-y-10">

        {/* LINE Login prompt */}
        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <LineLoginButton />
          </motion.div>
        )}

        {/* Quick Booking */}
        {isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <QuickBooking />
          </motion.div>
        )}

      </div>
    </div>
  );
}