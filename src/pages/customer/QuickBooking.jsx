import React, { useState } from 'react';
import { useLang } from '@/lib/LanguageContext';
import QuickBooking from '@/components/customer/QuickBooking';
import { motion, AnimatePresence } from 'framer-motion';

const E = [0.22, 1, 0.36, 1];

export default function QuickBookingPage() {
  const { lang } = useLang();
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-32 pt-6 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            {lang === 'th' ? 'Reserve Your Session' : 'Reserve Your Session'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === 'th' ? 'เลือกบริการและเวลาที่ต้องการ' : 'Select your service and preferred time'}
          </p>
        </div>
        <QuickBooking />
      </div>

      {/* Beta Notice Popup */}
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.45, ease: E }}
              className="w-full max-w-sm text-center"
              style={{
                background: 'rgba(20,18,24,0.92)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                padding: '32px 28px 28px',
                boxShadow: '0 24px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-full mx-auto mb-5 flex items-center justify-center"
                style={{
                  background: 'rgba(255,200,50,0.12)',
                  border: '1px solid rgba(255,200,50,0.25)',
                }}
              >
                <span style={{ fontSize: '22px' }}>🔔</span>
              </div>

              <p
                className="font-semibold mb-2"
                style={{ fontSize: '17px', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.92)', fontFamily: 'var(--font-body)' }}
              >
                {lang === 'th' ? 'ระบบทดลองใช้งาน' : 'Testing Mode'}
              </p>

              <p
                style={{ fontSize: '14px', lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)', letterSpacing: '0.03em' }}
              >
                {lang === 'th'
                  ? 'คิวเดือนพ.ค. เปิดจอง วันอาทิตย์ที่ 10 เวลา 18.00 น. /n สอบถามเพิ่มเติม ติดต่อ @mprivateproject'
                  : 'Booking opens at May 10, 6.00 pm. /n For more info please contract @mprivateproject'}
              </p>

              <button
                onClick={() => setDismissed(true)}
                className="mt-6 w-full rounded-2xl py-3 font-semibold tracking-[0.12em] uppercase transition-opacity hover:opacity-80 active:scale-95"
                style={{
                  fontSize: '13px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.75)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {lang === 'th' ? 'รับทราบ' : 'Close'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
