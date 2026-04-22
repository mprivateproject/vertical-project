import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { useTheme } from '@/lib/ThemeContext';
import { liffSyncClient } from '@/lib/liffSyncClient';
import {
  format, isToday, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isBefore, startOfDay, addMonths, subMonths
} from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

const SERVICES = [
  { id: 'house_signature_90', name_th: 'House Signature 90 นาที', name_en: 'House Signature 90 Min', duration_minutes: 90, price: 2950 },
];
const DEFAULT_THERAPIST = 'M';
const TIME_SLOTS = ['12:00', '15:00', '18:00', '21:00'];
const E = [0.22, 1, 0.36, 1];

const glass = {
  background: 'rgba(255,255,255,0.025)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.065)',
  borderRadius: '20px',
  boxShadow: '0 16px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
};

// Haptic helper — silent fallback on unsupported devices
const haptic = (ms = 8) => {
  if (navigator?.vibrate) navigator.vibrate(ms);
};

export default function QuickBooking() {
  const { t, lang } = useLang();
  const { ready, customer } = useLine();
  const { isDark } = useTheme();
  const isLoggedIn = ready;
  const isInvitedMember = customer?.is_invited_member === true;

  // Adaptive colors using CSS variables
  const c = {
    labelColor: `hsl(var(--muted-foreground) / 0.6)`,
    monthColor: `hsl(var(--foreground))`,
    navColor: `hsl(var(--muted-foreground) / 0.7)`,
    dayHeaderColor: `hsl(var(--muted-foreground) / 0.5)`,
    dayNormal: `hsl(var(--foreground) / 0.9)`,
    dayToday: `hsl(var(--foreground))`,
    dayPast: `hsl(var(--muted-foreground) / 0.3)`,
    daySelected: `hsl(var(--foreground))`,
    daySelectedBg: `hsl(var(--primary) / 0.15)`,
    daySelectedBorder: `hsl(var(--primary) / 0.4)`,
    todayDot: `hsl(var(--muted-foreground) / 0.5)`,
    svcNameSelected: `hsl(var(--foreground))`,
    svcNameUnselected: `hsl(var(--foreground) / 0.65)`,
    svcPriceSelected: `hsl(var(--foreground))`,
    svcPriceUnselected: `hsl(var(--foreground) / 0.55)`,
    svcBgSelected: isDark
      ? 'linear-gradient(150deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.08) 100%)'
      : 'linear-gradient(150deg, hsl(var(--primary) / 0.12) 0%, hsl(var(--primary) / 0.06) 100%)',
    svcBorderSelected: `hsl(var(--primary) / 0.35)`,
    svcBgUnselected: `hsl(var(--card))`,
    svcBorderUnselected: `hsl(var(--border))`,
    slotSelected: `hsl(var(--primary-foreground))`,
    slotUnselected: `hsl(var(--foreground) / 0.7)`,
    slotBgSelected: `hsl(var(--primary) / 0.15)`,
    slotBorderSelected: `hsl(var(--primary) / 0.4)`,
    slotBgUnselected: `hsl(var(--card))`,
    slotBorderUnselected: `hsl(var(--border))`,
    confirmColor: `hsl(var(--primary-foreground))`,
    confirmBg: isDark
      ? 'linear-gradient(150deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.08) 100%)'
      : 'linear-gradient(150deg, hsl(var(--primary) / 0.12) 0%, hsl(var(--primary) / 0.06) 100%)',
    confirmBorder: `hsl(var(--primary) / 0.35)`,
    glassCard: isDark ? {
      background: 'hsl(var(--card) / 0.8)',
      border: '1px solid hsl(var(--border))',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    } : {
      background: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    },
    noSlotColor: `hsl(var(--muted-foreground) / 0.5)`,
    loginHint: `hsl(var(--muted-foreground) / 0.6)`,
  };
  const queryClient = useQueryClient();
  const locale = lang === 'th' ? th : enUS;

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedService, setSelectedService] = useState(SERVICES[0]);
  const [done, setDone] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [monthDir, setMonthDir] = useState(1);
  const [datePulse, setDatePulse] = useState(null); // key of pulsing date

  const { data: existingBookings = [] } = useQuery({
    queryKey: ['bookings-quick', selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null],
    queryFn: async () => {
      const r = await liffSyncClient.call({
        url: '/functions/liffSync', method: 'POST',
        data: { action: 'getBookingsByDate', bookingDate: format(selectedDate, 'yyyy-MM-dd') }
      });
      return r.bookings || [];
    },
    enabled: !!selectedDate && !!ready,
  });

  const bookedSlots = useMemo(() =>
    existingBookings.filter(b => b.status !== 'cancelled').map(b => b.start_time),
    [existingBookings]
  );

  const now = new Date();
  const availableSlots = TIME_SLOTS.filter(slot => {
    if (bookedSlots.includes(slot)) return false;
    if (selectedDate && isToday(selectedDate)) {
      const [h, m] = slot.split(':').map(Number);
      if (h * 60 + m <= now.getHours() * 60 + now.getMinutes()) return false;
    }
    return true;
  });

  const createBooking = useMutation({
    mutationFn: async () => {
      const svc = selectedService;
      const duration = svc?.duration_minutes || 90;
      const [h, m] = selectedTime.split(':').map(Number);
      const endTotal = h * 60 + m + duration;
      const endTime = `${String(Math.floor(endTotal / 60)).padStart(2, '0')}:${String(endTotal % 60).padStart(2, '0')}`;
      const r = await liffSyncClient.call({
        url: '/functions/liffSync', method: 'POST',
        data: {
          action: 'createBooking',
          bookingData: {
            service_id: svc?.id || '',
            service_name: lang === 'th' ? svc?.name_th : svc?.name_en,
            therapist_name: DEFAULT_THERAPIST,
            booking_date: format(selectedDate, 'yyyy-MM-dd'),
            start_time: selectedTime,
            end_time: endTime,
            duration_minutes: duration,
            price: svc?.price || 0,
            status: 'pending',
            payment_status: 'unpaid',
          },
        },
      });
      return r.booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setDone(true);
    },
  });

  const changeMonth = useCallback((dir) => {
    haptic(6);
    setMonthDir(dir);
    setCalendarMonth(m => dir > 0 ? addMonths(m, 1) : subMonths(m, 1));
  }, []);

  const handleDateSelect = useCallback((day) => {
    haptic(8);
    setSelectedDate(day);
    setSelectedTime(null);
    setDatePulse(day.toISOString());
    setTimeout(() => setDatePulse(null), 400);
  }, []);

  // ── SUCCESS STATE ────────────────────────────────────────
  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: E }}
        style={glass}
        className="p-10 text-center space-y-6"
      >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 220, damping: 18 }}
        className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
        style={{
          background: `hsl(var(--primary) / 0.15)`,
          border: `1px solid hsl(var(--primary) / 0.35)`,
          boxShadow: `0 0 24px hsl(var(--primary) / 0.2)`,
        }}
      >
        <Check className="w-6 h-6" style={{ color: `hsl(var(--primary))` }} />
      </motion.div>
      <div>
        <p className="font-semibold text-[18px] tracking-[0.08em]" style={{ color: `hsl(var(--foreground))`, fontFamily: 'var(--font-body)' }}>{t('bookingConfirmed')}</p>
        <p className="text-[15px] mt-2 tracking-[0.05em]" style={{ color: `hsl(var(--muted-foreground) / 0.7)`, fontFamily: 'var(--font-body)' }}>
          {selectedDate && format(selectedDate, 'EEE d MMM', { locale })} · {selectedTime}
        </p>
      </div>
      <Link
        to="/bookings"
        className="inline-flex items-center gap-1.5 text-[14px] tracking-[0.15em] uppercase transition-opacity hover:opacity-60"
        style={{ color: `hsl(var(--muted-foreground) / 0.6)`, fontFamily: 'var(--font-body)' }}
      >
        {t('viewBookings')} <ChevronRight className="w-3 h-3" />
      </Link>
      </motion.div>
    );
  }

  // ── MAIN BOOKING UI ─────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 2vw, 20px)' }}>

      {/* ── SERVICE SELECTOR ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5, ease: E }}
      >
        <p style={{ fontSize: 'clamp(11px, 2.5vw, 16px)', color: c.labelColor, fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 'clamp(4px, 1vw, 10px)' }}>
          {t('service')}
        </p>
        <div className="flex gap-3">
          {SERVICES.map((svc) => {
            const name = lang === 'th' ? svc.name_th : svc.name_en;
            const isSelected = selectedService?.id === svc.id;
            return (
              <motion.button
                key={svc.id}
                onClick={() => { haptic(6); setSelectedService(svc); }}
                animate={{ scale: isSelected ? 1.03 : 1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className="flex-1 rounded-2xl text-left"
                style={{
                  padding: 'clamp(8px, 2vw, 16px)',
                  ...(isSelected ? {
                    background: c.svcBgSelected,
                    border: `1px solid ${c.svcBorderSelected}`,
                  } : {
                    background: c.svcBgUnselected,
                    border: `1px solid ${c.svcBorderUnselected}`,
                  })
                }}
              >
                <span
                  style={{ display: 'block', fontSize: 'clamp(13px, 3.5vw, 22px)', fontWeight: 600, letterSpacing: '0.05em', color: isSelected ? c.svcNameSelected : c.svcNameUnselected }}
                >
                  {name}
                </span>
                <span
                  style={{ display: 'block', fontSize: 'clamp(13px, 3.5vw, 22px)', fontWeight: 700, marginTop: '2px', tabularNums: true, color: isSelected ? c.svcPriceSelected : c.svcPriceUnselected, letterSpacing: '0.02em' }}
                >
                  ฿{svc.price?.toLocaleString()}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── INVITED MEMBER GATE ── */}
      {!isInvitedMember && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5, ease: E }}
          className="rounded-2xl px-6 py-8 text-center"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.75)',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,185,160,0.4)',
            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <p className="text-[28px] mb-4">✦</p>
          <p className="text-[18px] font-light mb-3"
           style={{ color: `hsl(var(--foreground))`, fontFamily: 'var(--font-body)', letterSpacing: '0.02em' }}>
           {lang === 'th' ? 'สำหรับ Invited Members เท่านั้น' : 'Invited Members Only'}
          </p>
          <p className="text-[15px] leading-relaxed"
           style={{ color: `hsl(var(--muted-foreground) / 0.7)`, fontFamily: 'var(--font-body)' }}>
           {lang === 'th'
             ? 'คิวการจองในวันที่ 14-31 พ.ค.'
             : 'Bookings for May 14–31'}
          </p>
          <p className="text-[15px] leading-relaxed mb-4"
           style={{ color: `hsl(var(--muted-foreground) / 0.7)`, fontFamily: 'var(--font-body)' }}>
           {lang === 'th'
             ? 'เปิดให้เฉพาะสมาชิกที่ได้รับเชิญเท่านั้น'
             : 'are open for invited members only'}
          </p>
          <p className="text-[14px] mb-1"
           style={{ color: `hsl(var(--muted-foreground) / 0.5)`, fontFamily: 'var(--font-body)' }}>
           {lang === 'th' ? 'กรุณาติดต่อเราเพื่อรับสิทธิ์' : 'Please contact us to receive an invitation'}
          </p>
          <p className="text-[15px] font-medium tracking-[0.08em]"
           style={{ color: `hsl(var(--muted-foreground))`, fontFamily: 'var(--font-body)' }}>
           LINE : @mprivateproject
          </p>
        </motion.div>
      )}

      {/* ── CALENDAR ── */}
      {isInvitedMember && <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.5, ease: E }}
      >
        <p style={{ fontSize: 'clamp(11px, 2.5vw, 16px)', color: c.labelColor, fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 'clamp(4px, 1vw, 10px)' }}>
          {t('date')}
        </p>

        <div style={{ ...glass, ...c.glassCard, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '20px', padding: 'clamp(8px, 2vw, 16px)' }} className="overflow-hidden relative">
          {/* Subtle light reflection sweep */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[20px]"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(255,255,255,0.01) 100%)',
            }}
          />

          {/* Month nav */}
          <div className="flex items-center justify-between" style={{ marginBottom: 'clamp(4px, 1.5vw, 12px)' }}>
            <motion.button
              whileTap={{ scale: 0.88, opacity: 0.5 }}
              onClick={() => changeMonth(-1)}
              className="flex items-center justify-center rounded-xl transition-all"
              style={{ width: 'clamp(28px, 6vw, 40px)', height: 'clamp(28px, 6vw, 40px)', color: c.navColor }}
            >
              <ChevronLeft style={{ width: 'clamp(14px, 3vw, 20px)', height: 'clamp(14px, 3vw, 20px)' }} />
            </motion.button>

            <AnimatePresence mode="wait">
              <motion.span
                key={format(calendarMonth, 'yyyy-MM')}
                initial={{ opacity: 0, x: monthDir * 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -monthDir * 16 }}
                transition={{ duration: 0.28, ease: E }}
                style={{ fontSize: 'clamp(14px, 4vw, 26px)', fontWeight: 600, letterSpacing: '0.15em', color: c.monthColor }}
              >
                {format(calendarMonth, 'MMMM yyyy', { locale }).toUpperCase()}
              </motion.span>
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.88, opacity: 0.5 }}
              onClick={() => changeMonth(1)}
              className="flex items-center justify-center rounded-xl transition-all"
              style={{ width: 'clamp(28px, 6vw, 40px)', height: 'clamp(28px, 6vw, 40px)', color: c.navColor }}
            >
              <ChevronRight style={{ width: 'clamp(14px, 3vw, 20px)', height: 'clamp(14px, 3vw, 20px)' }} />
            </motion.button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7" style={{ marginBottom: 'clamp(2px, 0.5vw, 6px)' }}>
            {(lang === 'th'
              ? ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
              : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
            ).map(d => (
              <div key={d} className="text-center font-medium tracking-[0.1em]" style={{ fontSize: 'clamp(10px, 3vw, 18px)', color: c.dayHeaderColor, padding: '2px 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={format(calendarMonth, 'yyyy-MM')}
              initial={{ opacity: 0, x: monthDir * 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -monthDir * 28 }}
              transition={{ duration: 0.32, ease: E }}
              className="grid grid-cols-7"
              style={{ rowGap: 'clamp(2px, 0.8vw, 8px)' }}
            >
              {(() => {
                const start = startOfMonth(calendarMonth);
                const end = endOfMonth(calendarMonth);
                const days = eachDayOfInterval({ start, end });
                const startPad = getDay(start);
                const cells = [];
                for (let i = 0; i < startPad; i++) cells.push(<div key={`pad-${i}`} />);
                days.forEach(day => {
                  const isPast = isBefore(day, startOfDay(today));
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentDay = isToday(day);
                  const isPulsing = datePulse === day.toISOString();

                  cells.push(
                    <div key={day.toISOString()} className="flex flex-col items-center gap-[3px]">
                      <motion.button
                        disabled={isPast}
                        onClick={() => !isPast && handleDateSelect(day)}
                        animate={isPulsing ? { scale: [1, 1.18, 0.96, 1] } : { scale: 1 }}
                        whileTap={!isPast ? { scale: 0.87 } : {}}
                        transition={isPulsing
                          ? { duration: 0.35, ease: E }
                          : { type: 'spring', stiffness: 300, damping: 22 }
                        }
                        className="flex items-center justify-center rounded-full font-semibold tabular-nums"
                        style={{ width: 'clamp(28px, 10vw, 52px)', height: 'clamp(28px, 10vw, 52px)', fontSize: 'clamp(12px, 4vw, 24px)' }}
                        style={isSelected ? {
                          background: c.daySelectedBg,
                          border: `1px solid ${c.daySelectedBorder}`,
                          color: c.daySelected,
                          letterSpacing: '0.02em',
                        } : isPast ? {
                          color: c.dayPast,
                          cursor: 'not-allowed',
                        } : isCurrentDay ? {
                          color: c.dayToday,
                        } : {
                          color: c.dayNormal,
                        }}
                      >
                        {format(day, 'd')}
                      </motion.button>
                      {/* Today dot */}
                      {isCurrentDay && (
                        <div
                          className="w-[3px] h-[3px] rounded-full"
                          style={{ background: isSelected ? c.daySelected : c.todayDot }}
                        />
                      )}
                    </div>
                  );
                });
                return cells;
              })()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>}

      {/* ── TIME SLOTS ── */}
      {isInvitedMember && <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: E }}
          >
            <p style={{ fontSize: 'clamp(11px, 2.5vw, 16px)', color: c.labelColor, fontFamily: 'var(--font-body)', fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 'clamp(4px, 1vw, 10px)' }}>
              {t('time')}
            </p>
            <div className="grid grid-cols-4" style={{ gap: 'clamp(4px, 1.5vw, 10px)' }}>
              {availableSlots.map((slot, i) => {
                const isSelected = selectedTime === slot;
                return (
                  <motion.button
                    key={slot}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4, ease: E }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => { haptic(8); setSelectedTime(slot); }}
                    className="rounded-2xl font-semibold tabular-nums tracking-[0.04em]"
                    style={{ padding: 'clamp(6px, 1.5vw, 12px) 0', fontSize: 'clamp(13px, 3.5vw, 20px)' }}
                    style={isSelected ? {
                      background: c.slotBgSelected,
                      border: `1px solid ${c.slotBorderSelected}`,
                      color: c.slotSelected,
                    } : {
                      background: c.slotBgUnselected,
                      border: `1px solid ${c.slotBorderUnselected}`,
                      color: c.slotUnselected,
                    }}
                  >
                    {slot}
                  </motion.button>
                );
              })}
              {availableSlots.length === 0 && (
                <p className="col-span-4 text-center py-5 text-[15px] tracking-[0.1em]" style={{ color: c.noSlotColor, fontFamily: 'var(--font-body)' }}>
                  ไม่มีช่วงเวลาว่าง
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>}

      {/* ── CONFIRM BUTTON ── */}
      {isInvitedMember && <AnimatePresence>
        {selectedDate && selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: E }}
          >
            {!isLoggedIn ? (
              <p className="text-center text-[14px] py-2 tracking-[0.1em]" style={{ color: c.loginHint, fontFamily: 'var(--font-body)' }}>
                กรุณาเข้าสู่ระบบด้วย LINE เพื่อจอง
              </p>
            ) : (
              <motion.button
                onClick={() => { haptic(12); createBooking.mutate(); }}
                disabled={createBooking.isPending}
                whileTap={{ scale: 0.97 }}
                animate={{
                  boxShadow: createBooking.isPending
                    ? '0 4px 16px rgba(0,0,0,0.3)'
                    : '0 0 32px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
                transition={{ duration: 0.4 }}
                className="w-full rounded-2xl font-semibold tracking-[0.25em] uppercase transition-opacity disabled:opacity-35"
                style={{ padding: 'clamp(10px, 2.5vw, 16px)', fontSize: 'clamp(13px, 3.5vw, 20px)' }}
                style={{
                  background: c.confirmBg,
                  border: `1px solid ${c.confirmBorder}`,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  color: c.confirmColor,
                }}
              >
                {createBooking.isPending ? '· · ·' : t('confirmBooking')}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>}
    </div>
  );
}