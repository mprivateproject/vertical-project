import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { useTheme } from '@/lib/ThemeContext';
import { liffSyncClient } from '@/lib/liffSyncClient';
import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { CalendarDays, Clock, X, ChevronDown, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BookingDetailSheet from '@/components/customer/BookingDetailSheet';
import HealthSafetyForm from '@/components/customer/HealthSafetyForm';

const E = [0.22, 1, 0.36, 1];

const haptic = (ms = 8) => { if (navigator?.vibrate) navigator.vibrate(ms); };

export default function BookingHistory() {
  const { t, lang } = useLang();
  const { idToken, ready } = useLine();
  const { isDark } = useTheme();
  const locale = lang === 'th' ? th : enUS;
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [checkInBookingId, setCheckInBookingId] = useState(null);
  const queryClient = useQueryClient();

  // Theme tokens
  const bg = isDark ? '#0E0F11' : '#F5F2EE';
  const cardBg = isDark
    ? 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #faf9f7 100%)';
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.08)';
  const cardShadow = isDark
    ? '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
    : '0 4px 20px rgba(0,0,0,0.07)';
  const dateBlockBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const dateBlockBorder = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)';
  const labelColor = isDark ? 'rgba(161,165,173,0.45)' : 'rgba(120,110,100,0.55)';
  const titleColor = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(40,35,30,0.92)';
  const serviceColor = isDark ? 'rgba(255,255,255,0.88)' : 'rgba(40,35,30,0.88)';
  const timeColor = isDark ? 'rgba(161,165,173,0.5)' : 'rgba(120,110,100,0.6)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const chevronColor = isDark ? 'rgba(161,165,173,0.25)' : 'rgba(120,110,100,0.3)';
  const skeletonBg = isDark
    ? 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)'
    : 'linear-gradient(135deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.02) 100%)';
  const skeletonBorder = isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)';

  const PremiumSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.15 }}
          className="h-24 rounded-2xl"
          style={{ background: skeletonBg, border: skeletonBorder }}
        />
      ))}
    </div>
  );

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

  const checkInMutation = useMutation({
    mutationFn: async ({ bookingId, formData }) => {
      await liffSyncClient.call({
        url: '/functions/liffSync', method: 'POST',
        data: { action: 'updateBookingStatus', bookingId, status: 'checked_in', healthForm: formData }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setCheckInBookingId(null);
    },
  });

  const today = format(new Date(), 'yyyy-MM-dd');
  const upcoming = bookings
    .filter(b => b.booking_date >= today && b.status !== 'cancelled')
    .sort((a, b) => a.booking_date.localeCompare(b.booking_date) || a.start_time.localeCompare(b.start_time));

  const paymentParam = new URLSearchParams(window.location.search).get('payment');

  return (
    <div className="min-h-screen pb-36" style={{ background: bg }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: isDark
          ? 'radial-gradient(ellipse at 50% -10%, rgba(198,200,204,0.04) 0%, transparent 60%)'
          : 'radial-gradient(ellipse at 50% -10%, rgba(180,160,120,0.06) 0%, transparent 60%)',
      }} />

      <div className="relative z-10 px-5 pt-14 space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: E }}
        >
          <p className="text-[9px] font-semibold tracking-[0.35em] uppercase mb-1"
            style={{ color: labelColor, fontFamily: 'Montserrat, sans-serif' }}>
            — UPCOMING · {upcoming.length} —
          </p>
          <h1
            className="text-2xl font-light tracking-wide"
            style={{ color: titleColor, fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '0.03em' }}
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
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(60,160,60,0.06)',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(60,160,60,0.15)',
                color: isDark ? 'rgba(200,220,200,0.8)' : 'rgba(40,130,40,0.85)',
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
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(180,60,60,0.05)',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(180,60,60,0.12)',
                color: isDark ? 'rgba(200,160,160,0.7)' : 'rgba(160,40,40,0.75)',
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
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="text-center py-20 space-y-6 px-4"
          >
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <CalendarDays className="w-7 h-7" style={{ color: isDark ? 'rgba(161,165,173,0.3)' : 'rgba(120,110,100,0.3)' }} />
            </div>

            <div className="space-y-2">
              <p
                className="text-[17px] font-light tracking-wide leading-relaxed"
                style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(40,35,30,0.65)', fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                {lang === 'th' ? 'เริ่มต้นช่วงเวลา\nแห่งความสงบของคุณ...' : 'Begin your moment\nof serenity...'}
              </p>
              <p
                className="text-[11px] tracking-[0.15em] uppercase"
                style={{ color: labelColor, fontFamily: 'Montserrat, sans-serif' }}
              >
                {lang === 'th' ? 'ยังไม่มีนัดหมายที่กำลังจะมาถึง' : 'No upcoming sessions yet'}
              </p>
            </div>

            <Link
              to="/selfbooking"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-[12px] font-semibold tracking-[0.2em] uppercase transition-all active:scale-95"
              style={{
                background: isDark
                  ? 'linear-gradient(150deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                  : 'linear-gradient(150deg, rgba(0,0,0,0.07) 0%, rgba(0,0,0,0.04) 100%)',
                border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.12)',
                color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(40,35,30,0.85)',
                fontFamily: 'Montserrat, sans-serif',
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.08)',
              }}
            >
              {lang === 'th' ? '✦ จองเลย' : '✦ Reserve Now'}
            </Link>
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
              const oneHourBefore = new Date(bookingDateTime.getTime() - 60 * 60 * 1000);
              const canCancel = (booking.status === 'pending' || booking.status === 'confirmed') && new Date() < twoHoursBefore;
              const canCheckIn = (booking.status === 'confirmed' || booking.status === 'pending') && booking.status !== 'checked_in';
              const checkInActive = new Date() >= oneHourBefore;

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: E }}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: cardBg,
                    border: cardBorder,
                    boxShadow: cardShadow,
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
                      style={{ background: dateBlockBg, border: dateBlockBorder }}
                    >
                      <span className="text-[9px] tracking-[0.2em] font-medium"
                        style={{ color: labelColor, fontFamily: 'Montserrat, sans-serif' }}>
                        {monthStr}
                      </span>
                      <span className="text-[24px] font-bold tabular-nums leading-tight"
                        style={{ color: titleColor, fontFamily: 'Montserrat, sans-serif' }}>
                        {dayStr}
                      </span>
                      <span className="text-[9px] tracking-[0.15em] font-medium"
                        style={{ color: labelColor, fontFamily: 'Montserrat, sans-serif' }}>
                        {weekStr}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] tracking-[0.25em] uppercase mb-1"
                        style={{ color: labelColor, fontFamily: 'Montserrat, sans-serif' }}>
                        Wellness · Massage
                      </p>
                      <p
                        className="text-[15px] font-light truncate leading-snug"
                        style={{
                          color: serviceColor,
                          fontFamily: 'Georgia, "Times New Roman", serif',
                          letterSpacing: '0.01em',
                        }}
                      >
                        {booking.service_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Clock className="w-3 h-3 flex-shrink-0" style={{ color: timeColor }} />
                        <span className="text-[11px] tabular-nums" style={{ color: timeColor }}>
                          {booking.start_time}
                          {booking.end_time ? ` – ${booking.end_time}` : ''}
                          {booking.duration_minutes ? ` · ${booking.duration_minutes} ${t('minutes')}` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Chevron */}
                    <ChevronDown
                      className="w-4 h-4 flex-shrink-0 -rotate-90"
                      style={{ color: chevronColor }}
                    />
                  </button>

                  {/* Check-in button */}
                  {canCheckIn && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!checkInActive) return;
                        haptic(12);
                        setCheckInBookingId(booking.id);
                      }}
                      className="w-full py-2.5 text-[10px] tracking-[0.2em] uppercase font-medium transition-all flex items-center justify-center gap-1.5"
                      style={{
                        borderTop: `1px solid ${dividerColor}`,
                        color: checkInActive
                          ? (isDark ? 'rgba(160,220,160,0.85)' : 'rgba(40,130,40,0.8)')
                          : (isDark ? 'rgba(161,165,173,0.22)' : 'rgba(120,110,100,0.28)'),
                        background: checkInActive
                          ? (isDark ? 'rgba(60,160,60,0.06)' : 'rgba(60,160,60,0.05)')
                          : 'transparent',
                        cursor: checkInActive ? 'pointer' : 'default',
                      }}
                    >
                      <LogIn className="w-3 h-3 opacity-80" />
                      {lang === 'th' ? 'ฉันมาถึงแล้ว' : 'I Have Arrived'}
                      {!checkInActive && (
                        <span className="text-[9px] tracking-normal normal-case ml-1"
                          style={{ color: isDark ? 'rgba(161,165,173,0.2)' : 'rgba(120,110,100,0.25)' }}>
                          ({lang === 'th' ? 'เปิดให้เช็คอินก่อนเวลาเริ่ม 60 นาที' : 'opens 60 min before'})
                        </span>
                      )}
                    </button>
                  )}

                  {/* Cancel button on card */}
                  {canCancel && (
                    <button
                      onClick={(e) => { e.stopPropagation(); haptic(12); cancelBookingMutation.mutate(booking.id); }}
                      className="w-full py-2.5 text-[10px] tracking-[0.2em] uppercase font-medium transition-all"
                      style={{
                        borderTop: `1px solid ${dividerColor}`,
                        color: isDark ? 'rgba(180,80,80,0.7)' : 'rgba(160,50,50,0.65)',
                        background: isDark ? 'rgba(180,60,60,0.04)' : 'rgba(180,60,60,0.03)',
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

      {/* Health & Safety form */}
      {checkInBookingId && (
        <HealthSafetyForm
          lang={lang}
          onClose={() => setCheckInBookingId(null)}
          onConfirm={async (formData) => {
            haptic(12);
            await checkInMutation.mutateAsync({ bookingId: checkInBookingId, formData });
          }}
        />
      )}

      {/* Detail sheet */}
      <BookingDetailSheet
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onCancel={(id) => { haptic(12); cancelBookingMutation.mutate(id); }}
        today={today}
        lang={lang}
        locale={locale}
        t={t}
      />
    </div>
  );
}    className="px-4 py-3 rounded-2xl text-[12px] text-center tracking-wide"
              style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(60,160,60,0.06)',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(60,160,60,0.15)',
                color: isDark ? 'rgba(200,220,200,0.8)' : 'rgba(40,130,40,0.85)',
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
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(180,60,60,0.05)',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(180,60,60,0.12)',
                color: isDark ? 'rgba(200,160,160,0.7)' : 'rgba(160,40,40,0.75)',
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
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="text-center py-20 space-y-6 px-4"
          >
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <CalendarDays className="w-7 h-7" style={{ color: isDark ? 'rgba(161,165,173,0.3)' : 'rgba(120,110,100,0.3)' }} />
            </div>

            <div className="space-y-2">
              <p
                className="text-[20px] font-light tracking-wide leading-relaxed"
                style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(40,35,30,0.65)', fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                {lang === 'th' ? 'เริ่มต้นช่วงเวลา\nแห่งความสงบของคุณ...' : 'Begin your moment\nof serenity...'}
              </p>
              <p
                className="text-[14px] tracking-[0.15em] uppercase"
                style={{ color: labelColor, fontFamily: 'Montserrat, sans-serif' }}
              >
                {lang === 'th' ? 'ยังไม่มีนัดหมายที่กำลังจะมาถึง' : 'No upcoming sessions yet'}
              </p>
            </div>

            <Link
              to="/selfbooking"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-[15px] font-semibold tracking-[0.2em] uppercase transition-all active:scale-95"
              style={{
                background: isDark
                  ? 'linear-gradient(150deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                  : 'linear-gradient(150deg, rgba(0,0,0,0.07) 0%, rgba(0,0,0,0.04) 100%)',
                border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.12)',
                color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(40,35,30,0.85)',
                fontFamily: 'Montserrat, sans-serif',
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.08)',
              }}
            >
              {lang === 'th' ? '✦ จองเลย' : '✦ Reserve Now'}
            </Link>
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
              const oneHourBefore = new Date(bookingDateTime.getTime() - 60 * 60 * 1000);
              const canCancel = (booking.status === 'pending' || booking.status === 'confirmed') && new Date() < twoHoursBefore;
              const canCheckIn = (booking.status === 'confirmed' || booking.status === 'pending') && booking.status !== 'checked_in';
              const checkInActive = new Date() >= oneHourBefore;

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: E }}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: cardBg,
                    border: cardBorder,
                    boxShadow: cardShadow,
                  }}
                >
                  {/* Main card row */}
                  <button
                   className="w-full text-left flex items-center gap-3 px-3 py-3 transition-all"
                   onClick={() => { haptic(8); setSelectedBooking(booking); }}
                  >
                   {/* Date block */}
                   <div
                     className="flex-shrink-0 flex flex-col items-center justify-center py-1.5 rounded-xl"
                     style={{ width: 'clamp(44px, 12vw, 56px)', background: dateBlockBg, border: dateBlockBorder }}
                   >
                     <span style={{ fontSize: 'clamp(9px, 2.5vw, 11px)', letterSpacing: '0.18em', fontWeight: 600, color: labelColor, fontFamily: 'Montserrat, sans-serif' }}>
                       {monthStr}
                     </span>
                     <span style={{ fontSize: 'clamp(18px, 5.5vw, 24px)', fontWeight: 700, lineHeight: 1.1, color: titleColor, fontFamily: 'Montserrat, sans-serif' }}>
                       {dayStr}
                     </span>
                     <span style={{ fontSize: 'clamp(9px, 2.5vw, 11px)', letterSpacing: '0.12em', fontWeight: 600, color: labelColor, fontFamily: 'Montserrat, sans-serif' }}>
                       {weekStr}
                     </span>
                   </div>

                   {/* Info */}
                   <div className="flex-1 min-w-0">
                     <p style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', letterSpacing: '-0.01em', textTransform: 'uppercase', marginBottom: '4px', color: labelColor, fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontWeight: 500 }}>
                       Wellness · Massage
                     </p>
                     <p
                       className="truncate leading-snug"
                       style={{
                         fontSize: 'clamp(16px, 3.8vw, 18px)',
                         fontWeight: 600,
                         color: serviceColor,
                         fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                         letterSpacing: '-0.015em',
                       }}
                     >
                       {booking.service_name}
                     </p>
                     <div className="flex items-center gap-1.5 mt-1">
                       <Clock className="w-2.5 h-2.5 flex-shrink-0" style={{ color: timeColor }} />
                       <span style={{ fontSize: 'clamp(10px, 3vw, 13px)', color: timeColor }}>
                         {booking.start_time}
                         {booking.end_time ? ` – ${booking.end_time}` : ''}
                         {booking.duration_minutes ? ` · ${booking.duration_minutes} ${t('minutes')}` : ''}
                       </span>
                     </div>
                   </div>

                   {/* Chevron */}
                   <ChevronDown
                     className="w-3.5 h-3.5 flex-shrink-0 -rotate-90"
                     style={{ color: chevronColor }}
                   />
                  </button>

                  {/* Check-in button */}
                  {canCheckIn && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!checkInActive) return;
                        haptic(12);
                        setCheckInBookingId(booking.id);
                      }}
                      className="w-full py-2 uppercase font-medium transition-all flex items-center justify-center gap-1.5"
                      style={{
                        fontSize: 'clamp(11px, 2.8vw, 12px)',
                        letterSpacing: '0.18em',
                        borderTop: `1px solid ${dividerColor}`,
                        color: checkInActive
                          ? (isDark ? 'rgba(160,220,160,0.85)' : 'rgba(40,130,40,0.8)')
                          : (isDark ? 'rgba(161,165,173,0.22)' : 'rgba(120,110,100,0.28)'),
                        background: checkInActive
                          ? (isDark ? 'rgba(60,160,60,0.06)' : 'rgba(60,160,60,0.05)')
                          : 'transparent',
                        cursor: checkInActive ? 'pointer' : 'default',
                      }}
                    >
                      <LogIn className="w-3 h-3 opacity-80" />
                      {lang === 'th' ? 'ฉันมาถึงแล้ว' : 'I Have Arrived'}
                      {!checkInActive && (
                        <span className="text-[12px] tracking-normal normal-case ml-1"
                          style={{ color: isDark ? 'rgba(161,165,173,0.2)' : 'rgba(120,110,100,0.25)' }}>
                          ({lang === 'th' ? 'เปิดให้เช็คอินก่อนเวลาเริ่ม 60 นาที' : 'opens 60 min before'})
                        </span>
                      )}
                    </button>
                  )}

                  {/* Cancel button on card */}
                  {canCancel && (
                    <button
                      onClick={(e) => { e.stopPropagation(); haptic(12); cancelBookingMutation.mutate(booking.id); }}
                      className="w-full py-2 uppercase font-medium transition-all"
                      style={{
                        fontSize: 'clamp(11px, 2.8vw, 12px)',
                        letterSpacing: '0.18em',
                        borderTop: `1px solid ${dividerColor}`,
                        color: isDark ? 'rgba(180,80,80,0.7)' : 'rgba(160,50,50,0.65)',
                        background: isDark ? 'rgba(180,60,60,0.04)' : 'rgba(180,60,60,0.03)',
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

      {/* Health & Safety form */}
      {checkInBookingId && (
        <HealthSafetyForm
          lang={lang}
          onClose={() => setCheckInBookingId(null)}
          onConfirm={async (formData) => {
            haptic(12);
            await checkInMutation.mutateAsync({ bookingId: checkInBookingId, formData });
          }}
        />
      )}

      {/* Detail sheet */}
      <BookingDetailSheet
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onCancel={(id) => { haptic(12); cancelBookingMutation.mutate(id); }}
        today={today}
        lang={lang}
        locale={locale}
        t={t}
      />
    </div>
  );
}