import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, getDaysInMonth, startOfMonth, addMonths, subMonths } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import LuxuryCard from './luxury-card';
import { cn } from '@/lib/utils';

const LuxuryCalendar = ({ selectedDate, onSelectDate, lang = 'th', disabledDates = [], fullyBookedDates = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const locale = lang === 'th' ? th : enUS;
  
  const monthStart = startOfMonth(currentMonth);
  const daysInMonth = getDaysInMonth(monthStart);
  const startDay = monthStart.getDay();
  const days = [];

  // Empty cells before first day
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  // Calendar days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), i));
  }

  const isDateDisabled = (date) => disabledDates.some(d => d.toDateString() === date.toDateString());
  const isDateSelected = (date) => selectedDate?.toDateString() === date.toDateString();
  const isDateFullyBooked = (date) => fullyBookedDates.some(d => d.toDateString() === date.toDateString());

  return (
    <LuxuryCard>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-white/10 rounded-md transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-text-primary" />
          </button>
          
          <div className="text-center">
            <p className="type-calendar-header">{format(currentMonth, 'MMMM yyyy', { locale })}</p>
          </div>

          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-white/10 rounded-md transition-all"
          >
            <ChevronRight className="w-4 h-4 text-text-primary" />
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 gap-1">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
            <div key={day} className="text-center">
              <p className="type-calendar-weekday">{day}</p>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} />;
            }

            const disabled = isDateDisabled(date);
            const selected = isDateSelected(date);
            const fullyBooked = isDateFullyBooked(date);

            return (
              <button
                key={date.toDateString()}
                onClick={() => !disabled && onSelectDate(date)}
                disabled={disabled}
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-180 ease-out type-calendar-date font-medium',
                  disabled && 'opacity-30 cursor-not-allowed',
                  selected && 'bg-gradient-to-br from-[#a855f7] to-[#3b82f6] type-calendar-date-selected shadow-glow-purple',
                  fullyBooked && 'bg-gradient-to-br from-[#a855f7] to-[#3b82f6] opacity-50',
                  !selected && !disabled && !fullyBooked && 'hover:bg-blue-500/20'
                )}
              >
                {format(date, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    </LuxuryCard>
  );
};

export default LuxuryCalendar;