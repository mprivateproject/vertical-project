import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
import { format } from 'date-fns';
import {
  CalendarDays, Users, DollarSign, TrendingUp,
  Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { t, lang } = useLang();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todayBookings = [] } = useQuery({
    queryKey: ['admin-today-bookings'],
    queryFn: () => base44.entities.Booking.filter({ booking_date: today }, 'start_time', 100),
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ['admin-all-bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date', 500),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => base44.entities.Customer.list('-created_date', 100),
  });

  const totalRevenue = allBookings
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + (b.price || 0), 0);

  const monthBookings = allBookings.filter(b => {
    const d = new Date(b.booking_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const stats = [
    {
      label: lang === 'th' ? 'การจองวันนี้' : "Today's Bookings",
      value: todayBookings.length,
      icon: CalendarDays,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: lang === 'th' ? 'รายได้รวม' : 'Total Revenue',
      value: `฿${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: t('customers'),
      value: customers.length,
      icon: Users,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: lang === 'th' ? 'จองเดือนนี้' : 'This Month',
      value: monthBookings.length,
      icon: TrendingUp,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  const statusCounts = {
    confirmed: todayBookings.filter(b => b.status === 'confirmed').length,
    in_progress: todayBookings.filter(b => b.status === 'in_progress').length,
    completed: todayBookings.filter(b => b.status === 'completed').length,
    cancelled: todayBookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          {t('adminDashboard')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {format(new Date(), 'EEEE, d MMMM yyyy')}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-xl font-bold text-foreground mt-1">{value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Today's status breakdown */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {lang === 'th' ? 'สถานะวันนี้' : "Today's Status"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            <StatusCard icon={CheckCircle} label={t('confirmed')} count={statusCounts.confirmed} color="text-blue-600" />
            <StatusCard icon={Clock} label={t('in_progress')} count={statusCounts.in_progress} color="text-indigo-600" />
            <StatusCard icon={CheckCircle} label={t('completed')} count={statusCounts.completed} color="text-green-600" />
            <StatusCard icon={XCircle} label={t('cancelled')} count={statusCounts.cancelled} color="text-red-500" />
          </div>
        </CardContent>
      </Card>

      {/* Today's appointments */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {lang === 'th' ? 'นัดหมายวันนี้' : "Today's Appointments"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t('noBookings')}
            </p>
          ) : (
            <div className="space-y-2">
              {todayBookings.map(booking => (
                <div
                  key={booking.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <div className="text-center min-w-[50px]">
                    <p className="font-bold text-sm text-foreground">{booking.start_time}</p>
                    <p className="text-[10px] text-muted-foreground">{booking.end_time}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {booking.customer_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {booking.service_name} • {booking.therapist_name}
                    </p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'in_progress' ? 'bg-indigo-100 text-indigo-700' :
                    booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {t(booking.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusCard({ icon: Icon, label, count, color }) {
  return (
    <div className="text-center p-3 rounded-lg bg-secondary/30">
      <Icon className={`w-5 h-5 mx-auto ${color}`} />
      <p className="font-bold text-foreground mt-1">{count}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}