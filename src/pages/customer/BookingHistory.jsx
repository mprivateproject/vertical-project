import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { liffSyncClient } from '@/lib/liffSyncClient';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { CalendarDays, Clock, User, X, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  const { idToken, ready } = useLine();
  const locale = lang === 'th' ? th : enUS;
  const [tab, setTab] = useState('upcoming');
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings', idToken],
    queryFn: async () => {
      const result = await liffSyncClient.call({ url: '/functions/liffSync', method: 'POST', data: { action: 'getBookings' } });
      return result.bookings || [];
    },
    enabled: !!ready,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId) => {
      await liffSyncClient.call({ url: '/functions/liffSync', method: 'POST', data: { action: 'cancelBooking', bookingId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });

  const [depositLoading, setDepositLoading] = useState(null); // bookingId

  const handleDepositCheckout = async (booking) => {
    if (window.self !== window.top) {
      alert(lang === 'th'
        ? 'การชำระเงินใช้ได้เฉพาะในแอปที่เปิดโดยตรง กรุณาเปิดในเบราว์เซอร์ภายนอก'
        : 'Payment is only available from the published app. Please open in an external browser.');
      return;
    }
    setDepositLoading(booking.id);
    const depositAmount = 500;
    const origin = window.location.origin;
    const res = await base44.functions.invoke('createCheckoutSession', {
      serviceName: (lang === 'th' ? `มัดจำ: ${booking.service_name}` : `Deposit: ${booking.service_name}`),
      price: depositAmount,
      bookingData: { ...booking, payment_method: 'credit_card' },
      successUrl: `${origin}/bookings?payment=success`,
      cancelUrl: `${origin}/bookings?payment=cancelled`,
    });
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      setDepositLoading(null);
    }
  };

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

      {new URLSearchParams(window.location.search).get('payment') === 'success' && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm text-center">
          {lang === 'th' ? '✅ ชำระเงินสำเร็จแล้ว!' : '✅ Payment successful!'}
        </div>
      )}
      {new URLSearchParams(window.location.search).get('payment') === 'cancelled' && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
          {lang === 'th' ? '❌ การชำระเงินถูกยกเลิก' : '❌ Payment was cancelled.'}
        </div>
      )}

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

              </div>

              <div className="mt-3 pt-3 border-t border-border space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-primary text-sm">฿{booking.price?.toLocaleString()}</span>
                    {booking.payment_status === 'unpaid' && (
                      <span className="ml-2 text-xs text-amber-600 font-medium">
                        {lang === 'th' ? '(ยังไม่ชำระ)' : '(unpaid)'}
                      </span>
                    )}
                    {booking.payment_status === 'pending' && (
                      <span className="ml-2 text-xs text-blue-600 font-medium">
                        {lang === 'th' ? '(รอชำระ)' : '(pending)'}
                      </span>
                    )}
                    {booking.payment_status === 'paid' && (
                      <span className="ml-2 text-xs text-green-600 font-medium">
                        {lang === 'th' ? '(ชำระแล้ว)' : '(paid)'}
                      </span>
                    )}
                  </div>
                  {(booking.status === 'pending' || booking.status === 'confirmed') && booking.booking_date >= today && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelBookingMutation.mutate(booking.id)}
                      disabled={cancelBookingMutation.isPending}
                      className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4 mr-1" />
                      <span className="text-xs">{t('cancel')}</span>
                    </Button>
                  )}
                </div>
                {/* Deposit button — show for active unpaid bookings */}
                {(booking.status === 'pending' || booking.status === 'confirmed') &&
                  booking.booking_date >= today &&
                  (booking.payment_status === 'unpaid' || booking.payment_status === 'pending') && (
                  <Button
                    size="sm"
                    onClick={() => handleDepositCheckout(booking)}
                    disabled={depositLoading === booking.id}
                    className="w-full h-9 rounded-xl text-xs font-semibold"
                  >
                    <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                    {depositLoading === booking.id
                      ? (lang === 'th' ? 'กำลังโหลด...' : 'Loading...')
                      : lang === 'th'
                        ? `จ่ายมัดจำ ฿500`
                        : `Pay ฿500 Deposit`
                    }
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}