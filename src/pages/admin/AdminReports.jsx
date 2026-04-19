import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminClient } from '@/lib/adminClient';
import { useLang } from '@/lib/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const PIE_COLORS = ['hsl(152,32%,40%)', 'hsl(35,45%,60%)', 'hsl(200,30%,50%)', 'hsl(280,20%,55%)', 'hsl(15,50%,55%)'];

export default function AdminReports() {
  const { t, lang } = useLang();

  const { data: bookings = [] } = useQuery({
    queryKey: ['report-bookings'],
    queryFn: () => adminClient.getAllBookings('-booking_date', 1000),
  });

  // Revenue by month
  const revenueByMonth = bookings
    .filter(b => b.payment_status === 'paid')
    .reduce((acc, b) => {
      const month = b.booking_date?.substring(0, 7);
      if (!month) return acc;
      acc[month] = (acc[month] || 0) + (b.price || 0);
      return acc;
    }, {});

  const revenueData = Object.entries(revenueByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, total]) => ({ month, total }));

  // Bookings by category
  const byCategory = bookings.reduce((acc, b) => {
    const svc = b.service_name || 'Other';
    acc[svc] = (acc[svc] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(byCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // Payment methods
  const byPayment = bookings.reduce((acc, b) => {
    const method = b.payment_method || 'unknown';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  const paymentData = Object.entries(byPayment)
    .map(([name, value]) => ({ name: t(name) || name, value }));

  const exportCSV = () => {
    const headers = 'Date,Customer,Service,Therapist,Price,Status,Payment\n';
    const rows = bookings.map(b =>
      `${b.booking_date},${b.customer_name},${b.service_name},${b.therapist_name},${b.price},${b.status},${b.payment_method}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">{t('reports')}</h1>
        <Button variant="outline" onClick={exportCSV} className="rounded-xl">
          <Download className="w-4 h-4 mr-2" /> {t('export')} CSV
        </Button>
      </div>

      {/* Revenue chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('revenue')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `฿${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(val) => [`฿${val.toLocaleString()}`, t('revenue')]} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top services */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {lang === 'th' ? 'บริการยอดนิยม' : 'Top Services'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment methods */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {lang === 'th' ? 'ช่องทางชำระเงิน' : 'Payment Methods'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {paymentData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}