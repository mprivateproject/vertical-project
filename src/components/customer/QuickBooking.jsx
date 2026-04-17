import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
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

export default function QuickBooking() {
  const { t, lang } = useLang();
  const { lineProfile, isLoggedIn } = useLine();
  const queryClient = useQueryClient();
  const locale = lang === 'th' ? th : enUS;

  const today = new Date();

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedService, setSelectedService] = useState(SERVICES[0]);
  const [done, setDone] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const { data: existingBookings = [] } = useQuery({
    queryKey: ['bookings-quick', selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null],
    queryFn: () => base44.entities.Booking.filter({ booking_date: format(selectedDate, 'yyyy-MM-dd') }),
    enabled: !!selectedDate
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
    mutationFn: () => {
      const svc = selectedService;
      const duration = svc?.duration_minutes || 90;
      const [h, m] = selectedTime.split(':').map(Number);
      const endTotal = h * 60 + m + duration;
      const endTime = `${String(Math.floor(endTotal / 60)).padStart(2, '0')}:${String(endTotal % 60).padStart(2, '0')}`;
      return base44.entities.Booking.create({
        customer_id: lineProfile?.lineUserId || 'guest',
        customer_name: lineProfile?.displayName || 'Guest',
        line_user_id: lineProfile?.lineUserId || '',
        service_id: svc?.id || '',
        service_name: lang === 'th' ? svc?.name_th : svc?.name_en,
        therapist_name: t('anyTherapist'),
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: selectedTime,
        end_time: endTime,
        duration_minutes: duration,
        price: svc?.price || 0,
        status: 'pending',
        payment_status: 'unpaid'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setDone(true);
    }
  });

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-border bg-card p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-foreground mx-auto flex items-center justify-center">
          <Check className="w-6 h-6 text-background" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-[15px]">{t('bookingConfirmed')}</p>
          <p className="text-muted-foreground text-[12px] mt-1">
            {selectedDate && format(selectedDate, 'EEE d MMM', { locale })} · {selectedTime}
          </p>
        </div>
        <Link
          to="/bookings"
          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
          {t('viewBookings')} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service selector */}
      <div>
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-3">
          {t('service')}
        </p>
        <div className="flex gap-2">
          {SERVICES.map((svc) => {
            const name = lang === 'th' ? svc.name_th : svc.name_en;
            const isSelected = selectedService?.id === svc.id;
            return (
              <button
                key={svc.id}
                onClick={() => setSelectedService(svc)}
                className={`px-4 py-2 rounded-full text-[12px] font-medium border transition-all duration-150 whitespace-nowrap ${
                  isSelected
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent text-muted-foreground border-border'
                }`}>
                <span className="normal-case block">{name}</span>
                <span className="opacity-60 text-[11px]">฿{svc.price?.toLocaleString()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date selector - Calendar */}
      <div>
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-3">
          {t('date')}
        </p>
        <div className="bg-card border border-border rounded-2xl p-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCalendarMonth(m => subMonths(m, 1))}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <span className="text-[13px] font-semibold text-foreground">
              {format(calendarMonth, 'MMMM yyyy', { locale })}
            </span>
            <button
              onClick={() => setCalendarMonth(m => addMonths(m, 1))}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          </div>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {(lang === 'th'
              ? ['อา','จ','อ','พ','พฤ','ศ','ส']
              : ['Su','Mo','Tu','We','Th','Fr','Sa']
            ).map(d => (
              <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-y-1">
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
                  <button
                    key={day.toISOString()}
                    disabled={isPast}
                    onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                    className={`aspect-square flex items-center justify-center rounded-full text-[12px] font-medium transition-all duration-150 mx-auto w-8 h-8
                      ${isSelected ? 'bg-foreground text-background' :
                        isCurrentDay ? 'border border-foreground text-foreground' :
                        isPast ? 'text-muted-foreground/40 cursor-not-allowed' :
                        'text-foreground hover:bg-secondary'}`}
                  >
                    {format(day, 'd')}
                  </button>
                );
              });
              return cells;
            })()}
          </div>
        </div>
      </div>

      {/* Time slots */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-3">
              {t('time')}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`py-2.5 rounded-lg border text-[13px] font-medium transition-all duration-150 ${
                    selectedTime === slot
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-card text-foreground border-border'
                  }`}>
                  {slot}
                </button>
              ))}
              {availableSlots.length === 0 && (
                <p className="col-span-4 text-center text-muted-foreground text-[13px] py-4">
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}>
            {!isLoggedIn ? (
              <p className="text-center text-[12px] text-muted-foreground py-2">
                กรุณาเข้าสู่ระบบด้วย LINE เพื่อจอง
              </p>
            ) : (
              <button
                onClick={() => createBooking.mutate()}
                disabled={createBooking.isPending}
                className="w-full py-4 rounded-xl bg-foreground text-background font-semibold text-[14px] tracking-wide disabled:opacity-50 transition-all active:scale-[0.98]"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                {createBooking.isPending ? '...' : t('confirmBooking')}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}