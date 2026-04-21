import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
import { adminClient } from '@/lib/adminClient';
import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { ArrowLeft, Mail, Phone, Calendar, DollarSign, Award, Users, MessageSquare, X, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';

export default function AdminCustomerDetail() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const locale = lang === 'th' ? th : enUS;
  const queryClient = useQueryClient();

  const [editingNotes, setEditingNotes] = useState(false);
  const [staffNotes, setStaffNotes] = useState('');

  // Fetch customer
  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ['customer-detail', customerId],
    queryFn: async () => {
      const customers = await adminClient.getCustomers();
      const found = customers?.find(c => c.id === customerId);
      if (found) setStaffNotes(found.notes || '');
      return found || null;
    },
  });

  // Fetch customer bookings
  const { data: bookings = [] } = useQuery({
    queryKey: ['customer-bookings', customerId],
    queryFn: async () => {
      const all = await adminClient.getAllBookings('-booking_date', 1000);
      return all?.filter(b => b.customer_id === customerId) || [];
    },
  });

  // Fetch loyalty tier
  const { data: loyaltyTier } = useQuery({
    queryKey: ['loyalty-tier', customer?.membership_tier],
    queryFn: () => adminClient.getLoyaltyTiers().then(tiers =>
      tiers?.find(t => t.tier_key === customer?.membership_tier) || null
    ),
    enabled: !!customer?.membership_tier,
  });

  // Update customer notes
  const updateNotesMutation = useMutation({
    mutationFn: async () => {
      await adminClient.updateCustomer(customerId, { notes: staffNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-detail'] });
      setEditingNotes(false);
    },
  });

  if (customerLoading) {
    return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  }

  if (!customer) {
    return <div className="p-6 text-center text-destructive">Customer not found</div>;
  }

  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalSpent = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/customers')}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-semibold">{customer.display_name}</h1>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            {lang === 'th' ? 'ข้อมูลลูกค้า' : 'Customer Info'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-6">
            {customer.picture_url && (
              <img
                src={customer.picture_url}
                alt={customer.display_name}
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}
            <div className="flex-1 space-y-3">
              {customer.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.line_user_id && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-xs bg-secondary px-2 py-1 rounded">LINE</span>
                  <span className="font-mono text-xs text-muted-foreground">{customer.line_user_id}</span>
                </div>
              )}
              {customer.last_visit_date && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{lang === 'th' ? 'ครั้งล่าสุด: ' : 'Last visit: '}{format(new Date(customer.last_visit_date), 'dd MMM yyyy', { locale })}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-primary">{customer.total_visits}</div>
            <div className="text-xs text-muted-foreground mt-1">{lang === 'th' ? 'ครั้งที่มา' : 'Visits'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div className="text-2xl font-bold">{totalSpent.toLocaleString()}</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{lang === 'th' ? 'ยอดค่าใช้จ่าย' : 'Total Spent'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <div className="text-2xl font-bold">{customer.loyalty_points}</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Pts</div>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty Tier */}
      {loyaltyTier && (
        <Card className="border-amber-200/30 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              {lang === 'th' ? 'สมาชิก' : 'Membership'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{loyaltyTier[lang === 'th' ? 'name_th' : 'name_en']}</span>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">{loyaltyTier.discount_percentage}% OFF</span>
            </div>
            {loyaltyTier[lang === 'th' ? 'benefits_th' : 'benefits_en']?.length > 0 && (
              <div className="space-y-1 text-sm">
                {loyaltyTier[lang === 'th' ? 'benefits_th' : 'benefits_en'].map((b, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Staff Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {lang === 'th' ? 'บันทึกพนักงาน' : 'Staff Notes'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingNotes ? (
            <div className="space-y-3">
              <Textarea
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                placeholder={lang === 'th' ? 'เพิ่มบันทึก...' : 'Add notes...'}
                className="min-h-[100px]"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setEditingNotes(false)}
                >
                  {t('close')}
                </Button>
                <Button
                  onClick={() => updateNotesMutation.mutate()}
                  disabled={updateNotesMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {t('save')}
                </Button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setEditingNotes(true)}
              className="p-3 rounded-lg bg-secondary cursor-pointer hover:bg-secondary/80 transition-colors min-h-[100px] flex items-center justify-center text-sm"
            >
              {staffNotes ? (
                <p className="whitespace-pre-wrap">{staffNotes}</p>
              ) : (
                <span className="text-muted-foreground">{lang === 'th' ? 'คลิกเพื่อเพิ่มบันทึก' : 'Click to add notes'}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{lang === 'th' ? 'ประวัติการจอง' : 'Booking History'}</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-6">
              {lang === 'th' ? 'ยังไม่มีการจอง' : 'No bookings'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-muted-foreground text-xs font-medium">
                    <th className="text-left py-2">{t('date')}</th>
                    <th className="text-left py-2">{t('service')}</th>
                    <th className="text-left py-2">{t('time')}</th>
                    <th className="text-left py-2">{t('status')}</th>
                    <th className="text-right py-2">{t('total')}</th>
                  </tr>
                </thead>
                <tbody className="space-y-1">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-border/50 hover:bg-secondary/50">
                      <td className="py-2">{format(new Date(booking.booking_date), 'dd MMM', { locale })}</td>
                      <td className="py-2">{booking.service_name}</td>
                      <td className="py-2 text-xs">{booking.start_time}</td>
                      <td className="py-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="text-right py-2 font-semibold">฿{booking.price?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}