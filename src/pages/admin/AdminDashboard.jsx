import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { liffSyncClient } from '@/lib/liffSyncClient';
import { useLang } from '@/lib/LanguageContext';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  CalendarDays, Users, TrendingUp, DollarSign,
  Clock, CheckCircle2, XCircle, ArrowUpRight,
  Scissors, BarChart3, Tag, GanttChartSquare,
  AlertCircle, RefreshCw, UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const STATUS_STYLES = {
  pending:    { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', label: 'Pending' },
  confirmed:  { bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',   label: 'Confirmed' },
  checked_in: { bg: 'bg-indigo-100 text-indigo-700',                                       label: 'Checked In' },
  in_progress:{ bg: 'bg-violet-100 text-violet-700',                                       label: 'In Progress' },
  completed:  { bg: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',label: 'Completed' },
  cancelled:  { bg: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',       label: 'Cancelled' },
  no_show:    { bg: 'bg-gray-100 text-gray-600',                                           label: 'No Show' },
};

export default function AdminDashboard() {
  const { t, lang } = useLang();
  const today = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();

  const { data: todayBookings = [], isLoading: loadingToday } = useQuery({
    queryKey: ['admin-today-bookings', today],
    queryFn: async () => {
      const r = await liffSyncClient.call({ url: '/functions/liffSync', method: 'POST', data: { action: 'adminGetBookingsByDate', bookingDate: today } });
      return r.bookings || [];
    },
  });

  const { data: allBookings = [], isLoading: loadingAll } = useQuery({
    queryKey: ['admin-all-bookings'],
    queryFn: async () => {
      const r = await liffSyncClient.call({ url: '/functions/liffSync', method: 'POST', data: { action: 'adminGetAllBookings', sort: '-booking_date', limit: 1000 } });
      return r.bookings || [];
    },
  });

  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const r = await liffSyncClient.call({ url: '/functions/liffSync', method: 'POST', data: { action: 'adminGetCustomers' } });
      return r.customers || [];
    },
  });

  const isLoading = loadingToday || loadingAll || loadingCustomers;

  // ── Analytics ──────────────────────────────────────────
  const thisMonth = { start: startOfMonth(now), end: endOfMonth(now) };
  const lastMonth = { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };

  const thisMonthBookings = allBookings.filter(b => {
    try { return isWithinInterval(parseISO(b.booking_date), thisMonth); } catch { return false; }
  });
  const lastMonthBookings = allBookings.filter(b => {
    try { return isWithinInterval(parseISO(b.booking_date), lastMonth); } catch { return false; }
  });

  const totalRevenue = allBookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + (b.price || 0), 0);
  const monthRevenue = thisMonthBookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + (b.price || 0), 0);
  const lastMonthRevenue = lastMonthBookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + (b.price || 0), 0);

  const revenueGrowth = lastMonthRevenue > 0
    ? Math.round(((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : null;

  const todayActive = todayBookings.filter(b => ['confirmed', 'checked_in', 'in_progress'].includes(b.status)).length;
  const todayCompleted = todayBookings.filter(b => b.status === 'completed').length;
  const todayCancelled = todayBookings.filter(b => b.status === 'cancelled').length;
  const todayPending = todayBookings.filter(b => b.status === 'pending').length;

  // ── Chart data: last 6 months ──────────────────────────
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(now, 5 - i);
    const range = { start: startOfMonth(date), end: endOfMonth(date) };
    const bookings = allBookings.filter(b => {
      try { return isWithinInterval(parseISO(b.booking_date), range); } catch { return false; }
    });
    const revenue = bookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + (b.price || 0), 0);
    return {
      month: format(date, 'MMM'),
      bookings: bookings.length,
      revenue: Math.round(revenue),
    };
  });

  // ── Recent bookings (last 8) ───────────────────────────
  const recentBookings = [...allBookings]
    .sort((a, b) => new Date(b.created_date || b.booking_date) - new Date(a.created_date || a.booking_date))
    .slice(0, 8);

  // ── Quick stats ────────────────────────────────────────
  const kpis = [
    {
      label: lang === 'th' ? 'จองวันนี้' : "Today's Bookings",
      value: todayBookings.length,
      sub: `${todayActive} active`,
      icon: CalendarDays,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      accent: 'border-l-blue-500',
    },
    {
      label: lang === 'th' ? 'รายได้เดือนนี้' : 'Monthly Revenue',
      value: `฿${monthRevenue.toLocaleString()}`,
      sub: revenueGrowth !== null ? `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}% vs last month` : 'vs last month',
      subColor: revenueGrowth !== null ? (revenueGrowth >= 0 ? 'text-green-600' : 'text-red-500') : 'text-muted-foreground',
      icon: DollarSign,
      iconBg: 'bg-green-500/10 text-green-600 dark:text-green-400',
      accent: 'border-l-green-500',
    },
    {
      label: lang === 'th' ? 'ลูกค้าทั้งหมด' : 'Total Customers',
      value: customers.length,
      sub: lang === 'th' ? 'ลงทะเบียนแล้ว' : 'registered',
      icon: Users,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      accent: 'border-l-purple-500',
    },
    {
      label: lang === 'th' ? 'การจองเดือนนี้' : 'This Month',
      value: thisMonthBookings.length,
      sub: `${lastMonthBookings.length} ${lang === 'th' ? 'เดือนที่แล้ว' : 'last month'}`,
      icon: TrendingUp,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      accent: 'border-l-amber-500',
    },
  ];

  const quickLinks = [
    { label: lang === 'th' ? 'ตารางวันนี้' : 'Today Schedule', icon: GanttChartSquare, to: '/admin/schedule', color: 'text-blue-600' },
    { label: lang === 'th' ? 'ลูกค้า' : 'Customers', icon: UserCheck, to: '/admin/customers', color: 'text-purple-600' },
    { label: lang === 'th' ? 'บริการ' : 'Services', icon: Scissors, to: '/admin/services', color: 'text-green-600' },
    { label: lang === 'th' ? 'รายงาน' : 'Reports', icon: BarChart3, to: '/admin/reports', color: 'text-amber-600' },
    { label: lang === 'th' ? 'โปรโมชั่น' : 'Promotions', icon: Tag, to: '/admin/promotions', color: 'text-rose-600' },
    { label: lang === 'th' ? 'ปฏิทิน' : 'Calendar', icon: CalendarDays, to: '/admin/calendar', color: 'text-indigo-600' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            {lang === 'th' ? 'แดชบอร์ด' : 'Dashboard'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(now, 'EEEE, d MMMM yyyy')}
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            {lang === 'th' ? 'กำลังโหลด...' : 'Loading...'}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(({ label, value, sub, subColor, icon: Icon, iconBg, accent }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className={`border-l-4 ${accent} border-border/60 shadow-sm hover:shadow-md transition-shadow`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground truncate">{label}</p>
                    <p className="text-xl font-bold text-foreground mt-1 leading-tight">{value}</p>
                    <p className={`text-[11px] mt-0.5 ${subColor || 'text-muted-foreground'}`}>{sub}</p>
                  </div>
                  <div className={`p-2 rounded-xl shrink-0 ${iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Today's Status Bar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                {lang === 'th' ? '📅 สถานะวันนี้' : "📅 Today's Status"}
              </CardTitle>
              <Link to="/admin/schedule" className="flex items-center gap-1 text-xs text-primary hover:underline">
                {lang === 'th' ? 'ดูตาราง' : 'View schedule'}
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: lang === 'th' ? 'รอดำเนินการ' : 'Pending',     count: todayPending,   icon: AlertCircle,   color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20' },
                { label: lang === 'th' ? 'ยืนยันแล้ว' : 'Active',       count: todayActive,    icon: Clock,         color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { label: lang === 'th' ? 'เสร็จสิ้น' : 'Completed',     count: todayCompleted, icon: CheckCircle2,  color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20' },
                { label: lang === 'th' ? 'ยกเลิก' : 'Cancelled',        count: todayCancelled, icon: XCircle,       color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20' },
              ].map(({ label, count, icon: Icon, color, bg }) => (
                <div key={label} className={`rounded-xl p-3 text-center ${bg}`}>
                  <Icon className={`w-5 h-5 mx-auto ${color}`} />
                  <p className="text-xl font-bold text-foreground mt-1">{count}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts + Recent Bookings */}
      <div className="grid lg:grid-cols-5 gap-4">

        {/* Revenue Chart */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                {lang === 'th' ? '📊 รายได้ 6 เดือนย้อนหลัง' : '📊 Revenue — Last 6 Months'}
              </CardTitle>
              <CardDescription className="text-xs">
                {lang === 'th' ? `รวม ฿${totalRevenue.toLocaleString()}` : `Total ฿${totalRevenue.toLocaleString()}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barSize={24} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${v/1000}k` : v} />
                  <Tooltip
                    formatter={(v, name) => [name === 'revenue' ? `฿${v.toLocaleString()}` : v, name === 'revenue' ? (lang === 'th' ? 'รายได้' : 'Revenue') : (lang === 'th' ? 'การจอง' : 'Bookings')]}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {/* Bookings mini chart */}
              <div className="mt-3 flex gap-1">
                {chartData.map(d => (
                  <div key={d.month} className="flex-1 text-center">
                    <div
                      className="mx-auto rounded-full bg-primary/20"
                      style={{ height: 4, width: `${Math.max(20, (d.bookings / (Math.max(...chartData.map(c => c.bookings)) || 1)) * 100)}%` }}
                    />
                    <p className="text-[9px] text-muted-foreground mt-1">{d.bookings}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-center text-muted-foreground mt-1">
                {lang === 'th' ? 'จำนวนการจองต่อเดือน' : 'Bookings per month'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                {lang === 'th' ? '⚡ ทางลัด' : '⚡ Quick Access'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2">
                {quickLinks.map(({ label, icon: Icon, to, color }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group"
                  >
                    <Icon className={`w-5 h-5 ${color} group-hover:scale-110 transition-transform`} />
                    <span className="text-[11px] font-medium text-foreground text-center leading-tight">{label}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Bookings Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                {lang === 'th' ? '🕒 การจองล่าสุด' : '🕒 Recent Bookings'}
              </CardTitle>
              <Link to="/admin/calendar" className="flex items-center gap-1 text-xs text-primary hover:underline">
                {lang === 'th' ? 'ดูทั้งหมด' : 'View all'}
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            {recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                {lang === 'th' ? 'ยังไม่มีข้อมูล' : 'No bookings yet'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 lg:px-6 py-2 text-xs font-medium text-muted-foreground">
                        {lang === 'th' ? 'ลูกค้า' : 'Customer'}
                      </th>
                      <th className="text-left px-2 py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">
                        {lang === 'th' ? 'บริการ' : 'Service'}
                      </th>
                      <th className="text-left px-2 py-2 text-xs font-medium text-muted-foreground">
                        {lang === 'th' ? 'วันที่' : 'Date'}
                      </th>
                      <th className="text-left px-2 py-2 text-xs font-medium text-muted-foreground hidden md:table-cell">
                        {lang === 'th' ? 'ราคา' : 'Price'}
                      </th>
                      <th className="text-left px-2 py-2 lg:px-4 text-xs font-medium text-muted-foreground">
                        {lang === 'th' ? 'สถานะ' : 'Status'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b, i) => {
                      const style = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
                      return (
                        <tr
                          key={b.id}
                          className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${i % 2 === 0 ? '' : 'bg-secondary/10'}`}
                        >
                          <td className="px-4 lg:px-6 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-primary">
                                  {(b.customer_name || '?').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-xs font-medium text-foreground truncate max-w-[80px]">
                                {b.customer_name || '—'}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-3 hidden sm:table-cell">
                            <span className="text-xs text-muted-foreground truncate max-w-[100px] block">
                              {b.service_name || '—'}
                            </span>
                          </td>
                          <td className="px-2 py-3">
                            <div>
                              <p className="text-xs font-medium text-foreground">{b.booking_date}</p>
                              <p className="text-[10px] text-muted-foreground">{b.start_time}</p>
                            </div>
                          </td>
                          <td className="px-2 py-3 hidden md:table-cell">
                            <span className="text-xs font-medium text-foreground">
                              ฿{(b.price || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-2 py-3 lg:px-4">
                            <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${style.bg}`}>
                              {style.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}