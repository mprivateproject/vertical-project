import React, { useState, useMemo } from 'react';
import { useLang } from '@/lib/LanguageContext';
import { format, addDays, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { motion } from 'framer-motion';

const generateTimeSlots = (start = '09:00', end = '20:00', interval = 30) => {
  const slots = [];
  let [h, m] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  
  while (h < endH || (h === endH && m < endM)) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += interval;
    if (m >= 60) { h++; m -= 60; }
  }
  return slots;
};

export default function TimeSlotPicker({ 
  selectedDate, onDateSelect, 
  selectedTime, onTimeSelect,
  bookedSlots = [],
  duration = 60 
}) {
  const { t, lang } = useLang();
  const locale = lang === 'th' ? th : enUS;
  
  const dates = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));
  }, []);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const now = new Date();

  return (
    <div className="space-y-5">
      {/* Date picker */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">{t('selectDate')}</h3>
        <div className="overflow-x-auto scrollbar-hide -mx-5 px-5">
          <div className="flex gap-2" style={{ width: 'max-content' }}>
            {dates.map((date, i) => {
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const dayName = format(date, 'EEE', { locale });
              const dayNum = format(date, 'd');
              const monthName = format(date, 'MMM', { locale });

              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onDateSelect(date)}
                  className={`flex flex-col items-center min-w-[56px] py-3 px-2 rounded-xl transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'bg-card border border-border'
                  }`}
                >
                  <span className={`text-[10px] font-medium ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {isToday(date) ? t('today') : dayName}
                  </span>
                  <span className={`text-2xl font-bold mt-0.5 ${isSelected ? '' : 'text-foreground'}`}>
                    {dayNum}
                  </span>
                  <span className={`text-[10px] ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {monthName}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">{t('availableSlots')}</h3>
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map((slot, i) => {
              const isBooked = bookedSlots.includes(slot);
              const isSelected = selectedTime === slot;
              
              // Disable past time slots for today
              const isPast = isToday(selectedDate) && (() => {
                const [slotH, slotM] = slot.split(':').map(Number);
                return slotH < now.getHours() || (slotH === now.getHours() && slotM <= now.getMinutes());
              })();

              return (
                <motion.button
                  key={slot}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  disabled={isBooked || isPast}
                  onClick={() => onTimeSelect(slot)}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : isBooked || isPast
                        ? 'bg-muted text-muted-foreground/40 cursor-not-allowed'
                        : 'bg-card border border-border text-foreground hover:border-primary/30'
                  }`}
                >
                  {slot}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}