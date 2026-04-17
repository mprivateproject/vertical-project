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
  pending: 'bg-muted text-foreground',
  confirmed: 'bg-primary text-primary-foreground',
  checked_in: 'bg-accent text-accent-foreground',
  in_progress: 'bg-primary/80 text-primary-foreground',
  completed: 'bg-muted text-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
  no_show: 'bg-muted text-muted-foreground',
};

export default function BookingHistory() {
  const { t, lang } = useLang();
  const { lineProfile } = useLine();
  const locale = lang === 'th' ? th : enUS;
  const [tab, setTab] = useState('upcoming');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings', lineProfile?.lineUserId],
    queryFn: async () => {
      if (!lineProfile?.lineUserId) return [];
      const res = await base44.functions.invoke('liffSync', {
        action: 'getBookings',
        lineUserId: lineProfile.lineUserId,
      });
      return res.data.bookings || [];
    },
    enabled: !!lineProfile?.lineUserId,
  });

  const today = format(new Date(), 'yyyy-MM-dd');
  const filtered = bookings.filter(b => {
    if (tab === 'upcoming') return b.booking_date >= today && b.status !== 'cancelled';
    if (tab === 'past') return b.booking_date < today || b.status === 'completed';
    if (tab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <div className="px-6 pt-16 pb-6 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-light text-foreground tracking-tight">
          {t('bookingHistory')}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">Your appointment history</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full bg-secondary rounded-none border-b border-border">
          <TabsTrigger value="upcoming" className="flex-1 rounded-none text-sm font-light border-b-2 border-transparent data-[state=active]:border-foreground">
            {t('upcoming')}
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1 rounded-none text-sm font-light border-b-2 border-transparent data-[state=active]:border-foreground">
            {t('past')}
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex-1 rounded-none text-sm font-light border-b-2 border-transparent data-[state=active]:border-foreground">
            {t('cancelled')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 rounded-sm bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <CalendarDays className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">{t('noBookings')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking, i) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-sm p-5 active:opacity-80 transition-opacity"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display text-sm font-light text-foreground">
                    {booking.service_name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(() => {
                      const d = new Date(booking.booking_date + 'T00:00:00');
                      return format(d, 'd MMM yyyy', { locale });
                    })()} • {booking.start_time}
                  </p>
                </div>
                <Badge className={`text-[10px] font-light ${statusStyles[booking.status] || 'bg-secondary text-secondary-foreground'}`}>
                  {t(booking.status)}
                </Badge>
              </div>

              <div className="flex items-end justify-between pt-2 border-t border-border/50">
                <div className="text-xs text-muted-foreground space-y-1">
                  {booking.therapist_name && <p>{booking.therapist_name}</p>}
                  <p>{booking.duration_minutes} min</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-light text-foreground block">
                    ฿{booking.price?.toLocaleString()}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-light mt-1">
                    {t(booking.payment_status || 'unpaid')}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}