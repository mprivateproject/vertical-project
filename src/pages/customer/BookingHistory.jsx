import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { liffSyncClient } from '@/lib/liffSyncClient';
import { base44 } from '@/api/base44Client';
import { format, parseISO } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { CalendarDays, Clock, X, CreditCard, ExternalLink, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BookingDetailSheet from '@/components/customer/BookingDetailSheet';

const E = [0.22, 1, 0.36, 1];

const haptic = (ms = 8) => { if (navigator?.vibrate) navigator.vibrate(ms); };

const PremiumSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map(i => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.15 }}
        className="h-24 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      />
    ))}
  </div>
);

export default function BookingHistory() {
  const { t, lang } = useLang();
  const { idToken, ready } = useLine();
  const locale = lang === 'th' ? th : enUS;
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [depositLoading, setDepositLoading] = useState(null);
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings', idToken],
    queryFn: async () => {
      const result = await liffSyncClient.call({
        url: '/functions/liffSync', method: 'POST',
        data: { action: 'getBookings' }
      });
      return result.bookings || [];
    },
    enabled: !!ready,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId) => {
      await liffSyncClient.call({
        url: '/functions/liffSync', method: 'POST',
        data: { action: 'cancelBooking', bookingId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setSelectedBooking(null);
    },
  });

  const handleDepositCheckout = async (booking) => {
    if (window.self !== window.top) {
      alert(lang === 'th'
        ? 'การชำระเงินใช้ได้เฉพาะในแอปที่เปิดโดยตรง'
        : 'Payment is only available from the published app.');
      return;
    }
    setDepositLoading(booking.id);
    const origin = window.location.origin;
    const res = await base44.functions.invoke('createCheckoutSession', {
      serviceName: lang === 'th' ? `มัดจำ: ${booking.service_name}` : `Deposit: ${booking.service_name}`,
      price: 500,
      bookingData: { ...booking, payment_method: 'credit_card' },
      successUrl: `${origin}/bookings?payment=success`,
      cancelUrl: `${origin}/bookings?payment=cancelled`,
    });
    if (res.data?.url) window.location.href = res.data.url;
    else setDepositLoading(null);
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const upcoming = bookings
    .filter(b => b.booking_date >= today && b.status !== 'cancelled')
    .sort((a, b) => a.booking_date.localeCompare(b.booking_date) || a.start_time.localeCompare(b.start_time));

  const paymentParam = new URLSearchParams(window.location.search).get('payment');

  return (
    <div className="min-h-screen pb-36" style={{ background: '#0E0F11' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse at 50% -10%, rgba(198,200,204,0.04) 0%, transparent 60%)',
      }} />

      <div className="relative z-10 px-5 pt-14 space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: E }}
        >
          <p className="text-[9px] font-semibold tracking-[0.35em] uppercase mb-1"
            style={{ color: 'rgba(161,165,173,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
            — UPCOMING · {upcoming.length} —
          </p>
          <h1
            className="text-2xl font-light tracking-wide"
            style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '0.03em' }}
          >
            {lang === 'th' ? 'บุ้คกิ้งของคุณ' : 'Upcomings'}
          </h1>
        </motion.div>

        {/* Payment feedback */}
        <AnimatePresence>
          {paymentParam === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="px-4 py-3 rounded-2xl text-[12px] text-center tracking-wide"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(200,220,200,0.8)',
              }}
            >
              {lang === 'th' ? '✓  ชำระเงินสำเร็จแล้ว' : '✓  Payment successful'}
            </motion.div>
          )}
          {paymentParam === 'cancelled' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="px-4 py-3 rounded-2xl text-[12px] text-center tracking-wide"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: 'rgba(200,160,160,0.7)',
              }}
            >
              {lang === 'th' ? '✕  การชำระเงินถูกยกเลิก' : '✕  Payment was cancelled'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking list */}
        {isLoading ? (
          <PremiumSkeleton />
        ) : upcoming.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 space-y-3"
          >
            <CalendarDays className="w-10 h-10 mx-auto" style={{ color: 'rgba(161,165,173,0.2)' }} />
            <p className="text-[12px] tracking-[0.15em] uppercase" style={{ color: 'rgba(161,165,173,0.35)' }}>
              {lang === 'th' ? 'ยังไม่มีนัดหมาย' : 'No upcoming sessions'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((booking, i) => {
              const dateObj = new Date(booking.booking_date + 'T00:00:00');
              const monthStr = format(dateObj, 'MMM', { locale }).toUpperCase();
              const dayStr = format(dateObj, 'd');
              const weekStr = format(dateObj, 'EEE', { locale }).toUpperCase();

              const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}:00`);
              const twoHoursBefore = new Date(bookingDateTime.getTime() - 2 * 60 * 60 * 1000);
              const canCancel = (booking.status === 'pending' || booking.status === 'confirmed') && new Date() < twoHoursBefore;

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: E }}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                  }}
                >
                  {/* Main card row */}
                  <button
                    className="w-full text-left flex items-center gap-4 px-4 py-4 transition-all"
                    onClick={() => { haptic(8); setSelectedBooking(booking); }}
                  >
                    {/* Date block */}
                    <div
                      className="flex-shrink-0 w-14 flex flex-col items-center justify-center py-2 rounded-xl"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <span className="text-[9px] tracking-[0.2em] font-medium"
                        style={{ color: 'rgba(161,165,173,0.5)', fontFamily: 'Montserrat, sans-serif' }}>
                        {monthStr}
                      </span>
                      <span className="text-[24px] font-bold tabular-nums leading-tight"
                        style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Montserrat, sans-serif' }}>
                        {dayStr}
                      </span>
                      <span className="text-[9px] tracking-[0.15em] font-medium"
                        style={{ color: 'rgba(161,165,173,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
                        {weekStr}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] tracking-[0.25em] uppercase mb-1"
                        style={{ color: 'rgba(161,165,173,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
                        Wellness · Massage
                      </p>
                      <p
                        className="text-[15px] font-light truncate leading-snug"
                        style={{
                          color: 'rgba(255,255,255,0.88)',
                          fontFamily: 'Georgia, "Times New Roman", serif',
                          letterSpacing: '0.01em',
                        }}
                      >
                        {booking.service_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Clock className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(161,165,173,0.35)' }} />
                        <span className="text-[11px] tabular-nums" style={{ color: 'rgba(161,165,173,0.5)' }}>
                          {booking.start_time}
                          {booking.end_time ? ` – ${booking.end_time}` : ''}
                          {booking.duration_minutes ? ` · ${booking.duration_minutes} ${t('minutes')}` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Chevron */}
                    <ChevronDown
                      className="w-4 h-4 flex-shrink-0 -rotate-90"
                      style={{ color: 'rgba(161,165,173,0.25)' }}
                    />
                  </button>

                  {/* Cancel button on card */}
                  {canCancel && (
                    <button
                      onClick={(e) => { e.stopPropagation(); haptic(12); cancelBookingMutation.mutate(booking.id); }}
                      className="w-full py-2.5 text-[10px] tracking-[0.2em] uppercase font-medium transition-all"
                      style={{
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        color: 'rgba(180,80,80,0.7)',
                        background: 'rgba(180,60,60,0.04)',
                      }}
                    >
                      <X className="w-3 h-3 inline mr-1.5 opacity-70" />
                      {lang === 'th' ? 'ยกเลิกนัดหมาย' : 'Cancel Booking'}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail sheet */}
      <BookingDetailSheet
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onCancel={(id) => { haptic(12); cancelBookingMutation.mutate(id); }}
        onDeposit={handleDepositCheckout}
        depositLoading={depositLoading}
        today={today}
        lang={lang}
        locale={locale}
        t={t}
      />
    </div>
  );
}