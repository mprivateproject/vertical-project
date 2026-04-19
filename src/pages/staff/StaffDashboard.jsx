import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { liffSyncClient } from '@/lib/liffSyncClient';
import { useLang } from '@/lib/LanguageContext';
import { format, isToday, addDays } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import {
  CalendarDays, Clock, User, ChevronLeft, ChevronRight, ArrowLeft, UserX
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LanguageToggle from '@/components/shared/LanguageToggle';
import ThemeToggle from '@/components/shared/ThemeToggle';
import AdminAuthGuard from '@/components/shared/AdminAuthGuard';

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  checked_in: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-gray-100 text-gray-600',
};

export default function StaffDashboard() {
  const { t, lang } = useLang();
  const locale = lang === 'th' ? th : enUS;
  const queryClient = useQueryClient();
  const [viewDate, setViewDate] = useState(new Date());
  const [filterTherapist, setFilterTherapist] = useState('all');

  const dateStr = format(viewDate, 'yyyy-MM-dd');

  const { data: allBookings = [], isLoading } = useQuery({
    queryKey: ['staff-bookings', dateStr],
    queryFn: async () => {
      const result = await liffSyncClient.call({ url: '/functions/liffSync', method: 'POST', data: { action: 'adminGetBookingsByDate', bookingDate: dateStr } });
      return result.bookings || [];
    },
  });

  const therapistNames = [...new Set(allBookings.map(b => b.therapist_name).filter(Boolean))];

  const bookings = filterTherapist === 'all'
    ? allBookings
    : allBookings.filter(b => b.therapist_name === filterTherapist);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const result = await liffSyncClient.call({ url: '/functions/liffSync', method: 'POST', data: { action: 'adminUpdateBooking', bookingId: id, data: { status } } });
      return result.booking;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-bookings'] }),
  });

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    inProgress: bookings.filter(b => b.status === 'in_progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  return (
    <AdminAuthGuard>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-xl border-b border-border px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-lg hover:bg-secondary">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold text-lg text-foreground">{t('staffDashboard')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Date nav */}
        <div className="flex items-center justify-between">
          <button onClick={() => setViewDate(d => addDays(d, -1))} className="p-2 rounded-lg hover:bg-secondary">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="font-semibold text-foreground">
              {isToday(viewDate) ? t('today') : format(viewDate, 'EEEE', { locale })}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(viewDate, 'd MMMM yyyy', { locale })}
            </p>
          </div>
          <button onClick={() => setViewDate(d => addDays(d, 1))} className="p-2 rounded-lg hover:bg-secondary">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* Therapist filter */}
        {therapistNames.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterTherapist('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${filterTherapist === 'all' ? 'bg-foreground text-background border-foreground' : 'bg-card border-border text-muted-foreground'}`}
            >
              {lang === 'th' ? 'ทั้งหมด' : 'All'}
            </button>
            {therapistNames.map(name => (
              <button
                key={name}
                onClick={() => setFilterTherapist(name)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${filterTherapist === name ? 'bg-foreground text-background border-foreground' : 'bg-card border-border text-muted-foreground'}`}
              >
                {name}
              </button>
            ))}
          </div>
        )}
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: t('all'), value: stats.total, color: 'bg-secondary' },
            { label: t('confirmed'), value: stats.confirmed, color: 'bg-blue-50' },
            { label: t('in_progress'), value: stats.inProgress, color: 'bg-indigo-50' },
            { label: t('completed'), value: stats.completed, color: 'bg-green-50' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${color} rounded-xl p-3 text-center`}>
              <p className="text-lg font-bold text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Booking list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
            {t('noBookings')}
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.map((booking, i) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{booking.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{booking.service_name}</p>
                  </div>
                  <Badge className={`text-[10px] ${statusStyles[booking.status]}`}>
                    {t(booking.status)}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {booking.start_time} - {booking.end_time}
                  </span>
                  {booking.therapist_name && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {booking.therapist_name}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {booking.status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus.mutate({ id: booking.id, status: 'checked_in' })}
                      className="h-8 text-xs rounded-lg"
                    >
                      {t('checkIn')}
                    </Button>
                  )}
                  {booking.status === 'checked_in' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus.mutate({ id: booking.id, status: 'in_progress' })}
                      className="h-8 text-xs rounded-lg"
                    >
                      {lang === 'th' ? 'เริ่มทรีตเมนต์' : 'Start'}
                    </Button>
                  )}
                  {booking.status === 'in_progress' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus.mutate({ id: booking.id, status: 'completed' })}
                      className="h-8 text-xs rounded-lg bg-green-600 hover:bg-green-700"
                    >
                      {t('checkOut')}
                    </Button>
                  )}
                  {['confirmed', 'pending', 'checked_in'].includes(booking.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus.mutate({ id: booking.id, status: 'no_show' })}
                      className="h-8 text-xs rounded-lg border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      <UserX className="w-3 h-3 mr-1" />
                      {lang === 'th' ? 'ไม่มา' : 'No-show'}
                    </Button>
                  )}
                  {['confirmed', 'pending'].includes(booking.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus.mutate({ id: booking.id, status: 'cancelled' })}
                      className="h-8 text-xs rounded-lg text-destructive"
                    >
                      {t('cancel')}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
    </AdminAuthGuard>
  );
}