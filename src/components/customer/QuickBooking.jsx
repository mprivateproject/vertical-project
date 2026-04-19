import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
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
  { id: 'sport', name_th: '90 นาที', name_en: '90 Min', duration_minutes: 90, price: 2950 },
  { id: 'aroma', name_th: '120 นาที', name_en: '120 Min', duration_minutes: 120, price: 3450 },
];
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
  const { ready } = useLine();
  const isLoggedIn = ready;
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
            therapist_name: t('anyTherapist'),
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
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 0 24px rgba(255,255,255,0.08)',
          }}
        >
          <Check className="w-6 h-6" style={{ color: '#C6C8CC' }} />
        </motion.div>
        <div>
          <p className="font-semibold text-white text-[15px] tracking-[0.08em]">{t('bookingConfirmed')}</p>
          <p className="text-[12px] mt-2 tracking-[0.05em]" style={{ color: 'rgba(161,165,173,0.7)' }}>
            {selectedDate && format(selectedDate, 'EEE d MMM', { locale })} · {selectedTime}
          </p>
        </div>
        <Link
          to="/bookings"
          className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.15em] uppercase transition-opacity hover:opacity-60"
          style={{ color: 'rgba(161,165,173,0.55)' }}
        >
          {t('viewBookings')} <ChevronRight className="w-3 h-3" />
        </Link>
      </motion.div>
    );
  }

  // ── MAIN BOOKING UI ─────────────────────────────────────
  return (
    <div className="space-y-7">

      {/* ── SERVICE SELECTOR ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5, ease: E }}
      >
        <p className="text-[9px] font-semibold tracking-[0.3em] uppercase mb-4" style={{ color: 'rgba(161,165,173,0.45)', fontFamily: 'Montserrat, sans-serif' }}>
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
                animate={{
                  scale: isSelected ? 1.03 : 1,
                  boxShadow: isSelected
                    ? '0 0 28px rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.4)'
                    : '0 2px 8px rgba(0,0,0,0.3)',
                }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className="flex-1 px-4 py-4 rounded-2xl text-left"
                style={isSelected ? {
                  background: 'linear-gradient(150deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)',
                  border: '1px solid rgba(255,255,255,0.18)',
                } : {
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span
                  className="block text-[13px] font-semibold tracking-[0.05em]"
                  style={{ color: isSelected ? '#FFFFFF' : 'rgba(161,165,173,0.6)' }}
                >
                  {name}
                </span>
                <span
                  className="text-[13px] font-bold mt-1 block tabular-nums"
                  style={{ color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(161,165,173,0.4)', letterSpacing: '0.02em' }}
                >
                  ฿{svc.price?.toLocaleString()}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── CALENDAR ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.5, ease: E }}
      >
        <p className="text-[9px] font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: 'rgba(161,165,173,0.45)', fontFamily: 'Montserrat, sans-serif' }}>
          {t('date')}
        </p>

        <div style={glass} className="p-4 overflow-hidden relative">
          {/* Subtle light reflection sweep */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[20px]"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(255,255,255,0.01) 100%)',
            }}
          />

          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <motion.button
              whileTap={{ scale: 0.88, opacity: 0.5 }}
              onClick={() => changeMonth(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
              style={{ color: 'rgba(161,165,173,0.5)' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>

            <AnimatePresence mode="wait">
              <motion.span
                key={format(calendarMonth, 'yyyy-MM')}
                initial={{ opacity: 0, x: monthDir * 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -monthDir * 16 }}
                transition={{ duration: 0.28, ease: E }}
                className="text-[12px] font-semibold tracking-[0.2em]"
                style={{ color: '#FFFFFF' }}
              >
                {format(calendarMonth, 'MMMM yyyy', { locale }).toUpperCase()}
              </motion.span>
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.88, opacity: 0.5 }}
              onClick={() => changeMonth(1)}
              className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
              style={{ color: 'rgba(161,165,173,0.5)' }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {(lang === 'th'
              ? ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
              : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
            ).map(d => (
              <div key={d} className="text-center text-[9px] font-medium py-1 tracking-[0.15em]" style={{ color: 'rgba(161,165,173,0.3)' }}>
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
              className="grid grid-cols-7 gap-y-1"
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
                        className="w-8 h-8 flex items-center justify-center rounded-full text-[12px] font-semibold tabular-nums"
                        style={isSelected ? {
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.25)',
                          boxShadow: '0 0 16px rgba(255,255,255,0.08)',
                          color: '#FFFFFF',
                          letterSpacing: '0.02em',
                        } : isPast ? {
                          color: 'rgba(161,165,173,0.2)',
                          cursor: 'not-allowed',
                        } : isCurrentDay ? {
                          color: 'rgba(255,255,255,0.85)',
                        } : {
                          color: 'rgba(161,165,173,0.55)',
                        }}
                      >
                        {format(day, 'd')}
                      </motion.button>
                      {/* Today dot */}
                      {isCurrentDay && (
                        <div
                          className="w-[3px] h-[3px] rounded-full"
                          style={{ background: isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(161,165,173,0.4)' }}
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
      </motion.div>

      {/* ── TIME SLOTS ── */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: E }}
          >
            <p className="text-[9px] font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: 'rgba(161,165,173,0.45)', fontFamily: 'Montserrat, sans-serif' }}>
              {t('time')}
            </p>
            <div className="grid grid-cols-4 gap-2">
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
                    className="py-3.5 rounded-2xl text-[13px] font-semibold tabular-nums tracking-[0.04em]"
                    style={isSelected ? {
                      background: 'rgba(255,255,255,0.09)',
                      border: '1px solid rgba(255,255,255,0.22)',
                      boxShadow: '0 0 20px rgba(255,255,255,0.07), 0 4px 16px rgba(0,0,0,0.4)',
                      color: '#FFFFFF',
                    } : {
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.055)',
                      color: 'rgba(161,165,173,0.5)',
                    }}
                  >
                    {slot}
                  </motion.button>
                );
              })}
              {availableSlots.length === 0 && (
                <p className="col-span-4 text-center py-5 text-[12px] tracking-[0.1em]" style={{ color: 'rgba(161,165,173,0.4)' }}>
                  ไม่มีช่วงเวลาว่าง
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONFIRM BUTTON ── */}
      <AnimatePresence>
        {selectedDate && selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: E }}
          >
            {!isLoggedIn ? (
              <p className="text-center text-[11px] py-2 tracking-[0.1em]" style={{ color: 'rgba(161,165,173,0.4)' }}>
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
                className="w-full py-4 rounded-2xl font-semibold text-[13px] tracking-[0.25em] uppercase transition-opacity disabled:opacity-35"
                style={{
                  background: 'linear-gradient(150deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  color: '#FFFFFF',
                }}
              >
                {createBooking.isPending ? '· · ·' : t('confirmBooking')}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}