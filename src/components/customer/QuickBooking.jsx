import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { format, addDays, isToday } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

function generateSlots(start = '10:00', end = '20:00', interval = 60) {
  const slots = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (cur + interval <= endMin) {
    slots.push(`${String(Math.floor(cur / 60)).padStart(2, '0')}:${String(cur % 60).padStart(2, '0')}`);
    cur += interval;
  }
  return slots;
}

const TIME_SLOTS = generateSlots('10:00', '20:00', 60);

export default function QuickBooking() {
  const { t, lang } = useLang();
  const { lineProfile, isLoggedIn } = useLine();
  const queryClient = useQueryClient();
  const locale = lang === 'th' ? th : enUS;

  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [done, setDone] = useState(false);

  const { data: services = [] } = useQuery({
    queryKey: ['services-active'],
    queryFn: () => base44.entities.Service.filter({ is_active: true }, 'sort_order', 20),
  });

  const { data: existingBookings = [] } = useQuery({
    queryKey: ['bookings-quick', selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null],
    queryFn: () => base44.entities.Booking.filter({ booking_date: format(selectedDate, 'yyyy-MM-dd') }),
    enabled: !!selectedDate,
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
    mutationFn: () => {
      const svc = selectedService || services[0];
      const duration = svc?.duration_minutes || 60;
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
        payment_status: 'unpaid',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setDone(true);
    },
  });

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-border bg-card p-8 text-center space-y-4"
      >
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
          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('viewBookings')} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service selector */}
      {services.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-3">
            {t('service')}
          </p>
          <div className="overflow-x-auto -mx-6 px-6" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-2" style={{ width: 'max-content' }}>
              {services.map(svc => {
                const name = lang === 'th' ? svc.name_th : svc.name_en;
                const isSelected = (selectedService?.id || services[0]?.id) === svc.id;
                return (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc)}
                    className={`px-4 py-2 rounded-full text-[12px] font-medium border transition-all duration-150 whitespace-nowrap ${
                      isSelected
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-transparent text-muted-foreground border-border'
                    }`}
                  >
                    {name}
                    <span className="ml-2 opacity-60 text-[11px]">
                      ฿{svc.price?.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Date selector */}
      <div>
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-3">
          {t('date')}
        </p>
        <div className="overflow-x-auto -mx-6 px-6" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-2 pb-0.5" style={{ width: 'max-content' }}>
            {dates.map(date => {
              const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
              const dayLabel = format(date, 'EEE', { locale }).toUpperCase();
              const dayNum = format(date, 'd');
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                  className={`flex flex-col items-center px-3.5 py-3 rounded-xl border transition-all duration-150 min-w-[52px] ${
                    isSelected
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-card text-foreground border-border'
                  }`}
                >
                  <span className={`text-[10px] font-medium tracking-wider mb-1 ${isSelected ? 'text-background/60' : 'text-muted-foreground'}`}>
                    {dayLabel}
                  </span>
                  <span className="text-[15px] font-semibold leading-none">{dayNum}</span>
                </button>
              );
            })}
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
            transition={{ duration: 0.2 }}
          >
            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-3">
              {t('time')}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {availableSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`py-2.5 rounded-lg border text-[13px] font-medium transition-all duration-150 ${
                    selectedTime === slot
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-card text-foreground border-border'
                  }`}
                >
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
            exit={{ opacity: 0 }}
          >
            {!isLoggedIn ? (
              <p className="text-center text-[12px] text-muted-foreground py-2">
                กรุณาเข้าสู่ระบบด้วย LINE เพื่อจอง
              </p>
            ) : (
              <button
                onClick={() => createBooking.mutate()}
                disabled={createBooking.isPending}
                className="w-full py-4 rounded-xl bg-foreground text-background font-semibold text-[14px] tracking-wide disabled:opacity-50 transition-all active:scale-[0.98]"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
              >
                {createBooking.isPending ? '...' : t('confirmBooking')}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}