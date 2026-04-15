import React, { useState, useEffect } from 'react';
import { useLang } from '@/lib/LanguageContext';
import { CheckCircle, Clock, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PromptPayQR({ amount, onPaymentConfirmed }) {
  const { t, lang } = useLang();
  const [status, setStatus] = useState('pending'); // pending, checking, confirmed

  // Simulate payment confirmation after some time
  useEffect(() => {
    if (status === 'pending') {
      const timer = setTimeout(() => {
        setStatus('confirmed');
        onPaymentConfirmed?.();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="text-center space-y-4">
      <AnimatePresence mode="wait">
        {status === 'confirmed' ? (
          <motion.div
            key="confirmed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-3"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="font-semibold text-green-600">{t('paymentConfirmed')}</p>
          </motion.div>
        ) : (
          <motion.div
            key="pending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* QR Code placeholder */}
            <div className="w-56 h-56 mx-auto bg-white rounded-2xl border-2 border-border p-4 flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex flex-col items-center justify-center gap-2">
                <QrCode className="w-20 h-20 text-primary/60" />
                <p className="text-[10px] text-muted-foreground">PromptPay QR</p>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">
                ฿{amount?.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">{t('scanQR')}</p>
            </div>

            {/* Instructions */}
            <div className="bg-secondary/50 rounded-xl p-4 text-left space-y-2 text-xs text-muted-foreground">
              {lang === 'th' ? (
                <>
                  <p>1. เปิดแอปธนาคารหรือ e-Wallet</p>
                  <p>2. เลือก "สแกน QR" หรือ "พร้อมเพย์"</p>
                  <p>3. สแกน QR Code ด้านบน</p>
                  <p>4. ตรวจสอบจำนวนเงินและยืนยัน</p>
                </>
              ) : (
                <>
                  <p>1. Open your banking app or e-Wallet</p>
                  <p>2. Select "Scan QR" or "PromptPay"</p>
                  <p>3. Scan the QR code above</p>
                  <p>4. Verify the amount and confirm</p>
                </>
              )}
            </div>

            {/* Waiting indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>{t('paymentPending')}...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}