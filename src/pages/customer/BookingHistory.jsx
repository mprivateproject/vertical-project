import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { CalendarDays, Clock, User, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  checked_in: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-gray-100 text-gray-600',
};

export default function BookingHistory() {
  const { t, lang } = useLang();
  const { lineProfile } = useLine();
  const locale = lang === 'th' ? th : enUS;
  const [tab, setTab] = useState('upcoming');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings', lineProfile?.lineUserId],
    queryFn: () => base44.entities.Booking.list('-booking_date', 100),
  });

  const today = format(new Date(), 'yyyy-MM-dd');
  const filtered = bookings.filter(b => {
    if (tab === 'upcoming') return b.booking_date >= today && b.status !== 'cancelled';
    if (tab === 'past') return b.booking_date < today || b.status === 'completed';
    if (tab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <div className="px-5 pt-14 pb-6 space-y-5">
      <h1 className="font-display text-2xl font-semibold text-foreground">
        {t('bookingHistory')}
      </h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full bg-secondary rounded-xl">
          <TabsTrigger value="upcoming" className="flex-1 rounded-lg text-xs">
            {t('upcoming')}
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1 rounded-lg text-xs">
            {t('past')}
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex-1 rounded-lg text-xs">
            {t('cancelled')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">{t('noBookings')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking, i) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-4 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm text-foreground">
                  {booking.service_name}
                </h3>
                <Badge className={`text-[10px] font-medium ${statusStyles[booking.status] || 'bg-secondary text-secondary-foreground'}`}>
                  {t(booking.status)}
                </Badge>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>
                    {(() => {
                      const d = new Date(booking.booking_date + 'T00:00:00');
                      return format(d, 'EEEE d MMM yyyy', { locale });
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{booking.start_time} - {booking.end_time}</span>
                  <span>({booking.duration_minutes} {t('minutes')})</span>
                </div>
                {booking.therapist_name && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3.5 h-3.5" />
                    <span>{booking.therapist_name}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="font-bold text-primary text-sm">
                  ฿{booking.price?.toLocaleString()}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {t(booking.payment_status || 'unpaid')}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}