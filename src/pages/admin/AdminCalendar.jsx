import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminClient } from '@/lib/adminClient';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/LanguageContext';
import { format, addDays, startOfWeek, isToday, isSameDay } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, User, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const timeSlots = [];
for (let h = 9; h <= 20; h++) {
  timeSlots.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 20) timeSlots.push(`${String(h).padStart(2, '0')}:30`);
}

const statusColors = {
  confirmed: 'bg-blue-200 border-blue-400 text-blue-900',
  checked_in: 'bg-purple-200 border-purple-400 text-purple-900',
  in_progress: 'bg-indigo-200 border-indigo-400 text-indigo-900',
  completed: 'bg-green-200 border-green-400 text-green-900',
  pending: 'bg-amber-200 border-amber-400 text-amber-900',
  cancelled: 'bg-red-100 border-red-300 text-red-700 opacity-50',
};

export default function AdminCalendar() {
  const { t, lang } = useLang();
  const locale = lang === 'th' ? th : enUS;
  const [view, setView] = useState('daily');
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const dateRange = view === 'daily'
    ? [format(currentDate, 'yyyy-MM-dd')]
    : weekDays.map(d => format(d, 'yyyy-MM-dd'));

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-calendar', dateRange.join(',')],
    queryFn: () => Promise.all(dateRange.map(date => adminClient.getBookingsByDate(date))).then(results => results.flat()),
  });

  const { data: therapists = [] } = useQuery({
    queryKey: ['therapists'],
    queryFn: () => base44.entities.Therapist.filter({ is_active: true }),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          {t('schedule')}
        </h1>
        <Tabs value={view} onValueChange={setView}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="daily" className="text-xs">{t('dailyView')}</TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs">{t('weeklyView')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Date navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setCurrentDate(d => addDays(d, view === 'daily' ? -1 : -7))}
          className="p-2 rounded-lg hover:bg-secondary"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="font-semibold text-foreground">
            {view === 'daily'
              ? format(currentDate, 'EEEE d MMMM yyyy', { locale })
              : `${format(weekDays[0], 'd MMM', { locale })} - ${format(weekDays[6], 'd MMM yyyy', { locale })}`
            }
          </p>
        </div>
        <button
          onClick={() => setCurrentDate(d => addDays(d, view === 'daily' ? 1 : 7))}
          className="p-2 rounded-lg hover:bg-secondary"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header */}
            <div className="grid border-b border-border" style={{
              gridTemplateColumns: `80px repeat(${view === 'daily' ? therapists.length || 1 : 7}, 1fr)`
            }}>
              <div className="p-4 border-r border-border bg-muted" />
              {view === 'daily'
                ? therapists.map(th => (
                  <div key={th.id} className="p-4 border-r border-border bg-muted text-center">
                    <p className="text-xs font-medium text-foreground">{th.nickname}</p>
                  </div>
                ))
                : weekDays.map((day, i) => (
                  <div key={i} className={`p-4 border-r border-border text-center ${isToday(day) ? 'bg-primary/5' : 'bg-muted'}`}>
                    <p className="text-[10px] text-muted-foreground">{format(day, 'EEE', { locale })}</p>
                    <p className={`text-sm font-semibold ${isToday(day) ? 'text-primary' : 'text-foreground'}`}>
                      {format(day, 'd')}
                    </p>
                  </div>
                ))
              }
            </div>

            {/* Time rows */}
            {timeSlots.map(slot => (
              <div
                key={slot}
                className="grid border-b border-border/50"
                style={{
                  gridTemplateColumns: `80px repeat(${view === 'daily' ? therapists.length || 1 : 7}, 1fr)`
                }}
              >
                <div className="p-3 border-r border-border text-[10px] text-muted-foreground text-right pr-4">
                   {slot}
                 </div>
                {(view === 'daily' ? (therapists.length ? therapists : [null]) : weekDays).map((col, i) => {
                  const cellBookings = bookings.filter(b => {
                    if (view === 'daily') {
                      return b.start_time === slot && (!col || b.therapist_id === col.id);
                    } else {
                      return b.start_time === slot && b.booking_date === format(col, 'yyyy-MM-dd');
                    }
                  });

                  return (
                    <div key={i} className="border-r border-border/30 p-1.5 min-h-[48px]">
                       {cellBookings.map(bk => (
                         <div
                           key={bk.id}
                           className={`text-[10px] px-2 py-1.5 rounded border-l-2 ${statusColors[bk.status] || 'bg-secondary'}`}
                        >
                          <p className="font-medium truncate">{bk.customer_name}</p>
                          <p className="opacity-70 truncate">{bk.service_name}</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}