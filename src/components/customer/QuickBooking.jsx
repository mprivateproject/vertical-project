import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { liffSyncClient } from '@/lib/liffSyncClient';
import { format, isToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isBefore, startOfDay, addMonths, subMonths } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const SERVICES = [
  { id: 'sport', name_th: '90 นาที', name_en: '90 Min', duration_minutes: 90, price: 2950 },
  { id: 'aroma', name_th: '120 นาที', name_en: '120 Min', duration_minutes: 120, price: 3450 },
];

const TIME_SLOTS = ['12:00', '15:00', '18:00', '21:00'];

const glassCard = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '20px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
};

const easing = [0.22, 1, 0.36, 1];

export default function QuickBooking() {
  const { t, lang } = useLang();
  const { idToken, ready } = useLine();
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

  const { data: existingBookings = [] } = useQuery({
    queryKey: ['bookings-quick', selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null],
    queryFn: async () => {
      const result = await liffSyncClient.call({ url: '/functions/liffSync', method: 'POST', data: { action: 'getBookingsByDate', bookingDate: format(selectedDate, 'yyyy-MM-dd') } });
      return result.bookings || [];
    },
    enabled: !!selectedDate && !!ready
  });

  const bookedSlots = useMemo(() =>
    existingBookings.filter((b) => b.status !== 'cancelled').map((b) => b.start_time),
    [existingBookings]
  );

  const now = new Date();
  const availableSlots = TIME_SLOTS.filter((slot) => {
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
      const result = await liffSyncClient.call({
        url: '/functions/liffSync',
        method: 'POST',
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
      return result.booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setDone(true);
    }
  });

  const changeMonth = (dir) => {
    setMonthDir(dir);
    setCalendarMonth(m => dir > 0 ? addMonths(m, 1) : subMonths(m, 1));
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easing }}
        style={glassCard}
        className="p-8 text-center space-y-5"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <Check className="w-6 h-6" style={{ color: '#C6C8CC' }} />
        </motion.div>
        <div>
          <p className="font-semibold text-white text-[15px] tracking-wide">{t('bookingConfirmed')}</p>
          <p className="text-[12px] mt-1.5" style={{ color: '#A1A5AD' }}>
            {selectedDate && format(selectedDate, 'EEE d MMM', { locale })} · {selectedTime}
          </p>
        </div>
        <Link
          to="/bookings"
          className="inline-flex items-center gap-1.5 text-[12px] transition-all hover:opacity-80"
          style={{ color: '#A1A5AD' }}
        >
          {t('viewBookings')} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Service selector — pill segmented */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, ease: easing }}>
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: '#A1A5AD' }}>
          {t('service')}
        </p>
        <div className="flex gap-3">
          {SERVICES.map((svc) => {
            const name = lang === 'th' ? svc.name_th : svc.name_en;
            const isSelected = selectedService?.id === svc.id;
            return (
              <motion.button
                key={svc.id}
                onClick={() => setSelectedService(svc)}
                whileTap={{ scale: 0.97 }}
                animate={{ scale: isSelected ? 1.03 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex-1 px-4 py-3.5 rounded-2xl text-[13px] font-medium transition-all duration-300"
                style={isSelected ? {
                  background: 'linear-gradient(145deg, rgba(198,200,204,0.12), rgba(198,200,204,0.06))',
                  border: '1px solid rgba(198,200,204,0.2)',
                  boxShadow: '0 0 20px rgba(255,255,255,0.04)',
                  color: '#FFFFFF',
                } : {
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: '#A1A5AD',
                }}
              >
                <span className="block font-semibold tracking-wide">{name}</span>
                <span className="text-[11px] mt-0.5 block opacity-70">฿{svc.price?.toLocaleString()}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Calendar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease: easing }}>
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: '#A1A5AD' }}>
          {t('date')}
        </p>
        <div style={glassCard} className="p-4 overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-xl transition-all"
              style={{ color: '#A1A5AD' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <AnimatePresence mode="wait">
              <motion.span
                key={format(calendarMonth, 'yyyy-MM')}
                initial={{ opacity: 0, x: monthDir * 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -monthDir * 20 }}
                transition={{ duration: 0.25, ease: easing }}
                className="text-[13px] font-semibold tracking-wider"
                style={{ color: '#FFFFFF' }}
              >
                {format(calendarMonth, 'MMMM yyyy', { locale }).toUpperCase()}
              </motion.span>
            </AnimatePresence>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => changeMonth(1)}
              className="p-2 rounded-xl transition-all"
              style={{ color: '#A1A5AD' }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-3">
            {(lang === 'th'
              ? ['อา','จ','อ','พ','พฤ','ศ','ส']
              : ['Su','Mo','Tu','We','Th','Fr','Sa']
            ).map(d => (
              <div key={d} className="text-center text-[10px] font-medium py-1 tracking-widest" style={{ color: 'rgba(161,165,173,0.5)' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={format(calendarMonth, 'yyyy-MM')}
              initial={{ opacity: 0, x: monthDir * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -monthDir * 30 }}
              transition={{ duration: 0.3, ease: easing }}
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
                  cells.push(
                    <div key={day.toISOString()} className="flex flex-col items-center gap-0.5">
                      <motion.button
                        disabled={isPast}
                        onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                        whileTap={!isPast ? { scale: 0.9 } : {}}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-[12px] font-medium transition-all duration-300"
                        style={isSelected ? {
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          boxShadow: '0 0 12px rgba(255,255,255,0.06)',
                          color: '#FFFFFF',
                        } : isPast ? {
                          color: 'rgba(161,165,173,0.25)',
                          cursor: 'not-allowed',
                        } : {
                          color: '#A1A5AD',
                        }}
                      >
                        {format(day, 'd')}
                      </motion.button>
                      {/* Today dot */}
                      {isCurrentDay && (
                        <div className="w-1 h-1 rounded-full" style={{ background: isSelected ? '#FFFFFF' : '#A1A5AD' }} />
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

      {/* Time slots */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: easing }}
          >
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: '#A1A5AD' }}>
              {t('time')}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {availableSlots.map((slot, i) => (
                <motion.button
                  key={slot}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, ease: easing }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTime(slot)}
                  className="py-3 rounded-2xl text-[13px] font-medium transition-all duration-300"
                  style={selectedTime === slot ? {
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 0 16px rgba(255,255,255,0.05)',
                    color: '#FFFFFF',
                  } : {
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#A1A5AD',
                  }}
                >
                  {slot}
                </motion.button>
              ))}
              {availableSlots.length === 0 && (
                <p className="col-span-4 text-center py-5 text-[13px]" style={{ color: '#A1A5AD' }}>
                  ไม่มีช่วงเวลาว่าง
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm button */}
      <AnimatePresence>
        {selectedDate && selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: easing }}
          >
            {!isLoggedIn ? (
              <p className="text-center text-[12px] py-2" style={{ color: '#A1A5AD' }}>
                กรุณาเข้าสู่ระบบด้วย LINE เพื่อจอง
              </p>
            ) : (
              <motion.button
                onClick={() => createBooking.mutate()}
                disabled={createBooking.isPending}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-2xl font-semibold text-[14px] tracking-widest uppercase transition-all disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, rgba(198,200,204,0.15) 0%, rgba(198,200,204,0.08) 100%)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
                  color: '#FFFFFF',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {createBooking.isPending ? '...' : t('confirmBooking')}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}