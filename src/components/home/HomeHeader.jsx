import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import LanguageToggle from '@/components/shared/LanguageToggle';

export default function HomeHeader() {
  const { lang } = useLang();
  const { lineProfile, isLoggedIn } = useLine();
  const locale = lang === 'th' ? th : enUS;

  const dateStr = format(new Date(), 'EEEE, d MMMM yyyy', { locale });
  const greeting = lang === 'th' ? 'สวัสดี' : 'Hello,';
  const name = isLoggedIn && lineProfile?.displayName
    ? lineProfile.displayName
    : lang === 'th' ? 'ยินดีต้อนรับ' : 'Welcome';

  return (
    <div className="px-5 pt-14 pb-6">
      {/* Date */}
      <motion.p
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-[10px] tracking-[0.28em] uppercase mb-3"
        style={{ color: 'rgba(198,200,204,0.35)', fontFamily: 'Montserrat, sans-serif' }}
      >
        {dateStr}
      </motion.p>

      {/* Greeting row */}
      <div className="flex items-center justify-between gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[13px] font-light tracking-[0.12em] mb-0.5" style={{ color: 'rgba(198,200,204,0.5)', fontFamily: 'Montserrat, sans-serif' }}>
            {greeting}
          </p>
          <h1
            className="text-2xl font-semibold text-white leading-tight"
            style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '-0.01em' }}
          >
            {name}
          </h1>
        </motion.div>

        {/* Right side controls */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex items-center gap-2 shrink-0"
        >
          <LanguageToggle />
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full relative"
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}
          >
            <Bell className="w-4 h-4" style={{ color: 'rgba(198,200,204,0.7)' }} />
            {/* Notification dot */}
            <span
              className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
              style={{ background: 'rgba(201,168,76,0.9)' }}
            />
          </button>
        </motion.div>
      </div>
    </div>
  );
}