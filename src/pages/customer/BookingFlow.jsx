import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { ArrowLeft, Check, Clock, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import TherapistPicker from '@/components/customer/TherapistPicker';
import TimeSlotPicker from '@/components/customer/TimeSlotPicker';
import PaymentMethodPicker from '@/components/customer/PaymentMethodPicker';
import PromptPayQR from '@/components/customer/PromptPayQR';
import LineLoginButton from '@/components/customer/LineLoginButton';

const STEPS = ['therapist', 'datetime', 'payment', 'confirm'];

export default function BookingFlow() {
  const { t, lang } = useLang();
  const { lineProfile, customer, isLoggedIn } = useLine();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const locale = lang === 'th' ? th : enUS;

  const params = new URLSearchParams(window.location.search);
  const serviceId = params.get('serviceId');

  const [step, setStep] = useState(0);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('promptpay');
  const [bookingComplete, setBookingComplete] = useState(false);
  const [showPaymentQR, setShowPaymentQR] = useState(false);

  const { data: service } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const services = await base44.entities.Service.filter({ id: serviceId });
      return services[0];
    },
    enabled: !!serviceId,
  });

  const { data: therapists = [] } = useQuery({
    queryKey: ['therapists'],
    queryFn: () => base44.entities.Therapist.filter({ is_active: true }),
  });

  const { data: existingBookings = [] } = useQuery({
    queryKey: ['bookings-for-date', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      const res = await base44.functions.invoke('liffSync', {
        action: 'getBookingsByDate',
        lineUserId: lineProfile?.lineUserId || '',
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
      });
      return res.data.bookings || [];
    },
    enabled: !!selectedDate,
  });

  const bookedSlots = useMemo(() => {
    return existingBookings
      .filter(b => b.status !== 'cancelled')
      .filter(b => !selectedTherapist || b.therapist_id === selectedTherapist?.id)
      .map(b => b.start_time);
  }, [existingBookings, selectedTherapist]);

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      const [h, m] = selectedTime.split(':').map(Number);
      const total = h * 60 + m + (service?.duration_minutes || 60);
      const endMinutes = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;

      const res = await base44.functions.invoke('liffSync', {
        action: 'createBooking',
        lineUserId: lineProfile?.lineUserId || '',
        bookingData: {
          customer_id: customer?.id || lineProfile?.lineUserId || 'guest',
          customer_name: lineProfile?.displayName || 'Guest',
          line_user_id: lineProfile?.lineUserId || '',
          service_id: serviceId,
          service_name: lang === 'th' ? service?.name_th : service?.name_en,
          therapist_id: selectedTherapist?.id || '',
          therapist_name: selectedTherapist?.nickname || t('anyTherapist'),
          booking_date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: selectedTime,
          end_time: endMinutes,
          duration_minutes: service?.duration_minutes || 60,
          price: service?.price || 0,
          status: 'confirmed',
          payment_status: paymentMethod === 'cash' ? 'unpaid' : 'paid',
          payment_method: paymentMethod,
        },
      });
      return res.data.booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setBookingComplete(true);
    },
  });

  const canProceed = () => {
    switch (step) {
      case 0: return true; // therapist is optional
      case 1: return selectedDate && selectedTime;
      case 2: return paymentMethod;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      if (paymentMethod === 'promptpay') {
        setShowPaymentQR(true);
      } else {
        createBookingMutation.mutate();
      }
    }
  };

  const serviceName = service ? (lang === 'th' ? service.name_th : service.name_en) : '';

  if (bookingComplete) {
    return (
      <div className="px-6 pt-24 pb-6 text-center space-y-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 rounded-full bg-foreground mx-auto flex items-center justify-center"
        >
          <Check className="w-8 h-8 text-background" />
        </motion.div>
        <div className="space-y-3">
          <h1 className="font-display text-3xl font-light text-foreground">
            {t('bookingConfirmed')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {serviceName} • {selectedDate && format(selectedDate, 'd MMM', { locale })} • {selectedTime}
          </p>
        </div>
        <div className="space-y-3 pt-4">
          <Link
            to="/bookings"
            className="block w-full py-3 rounded-sm bg-primary text-primary-foreground font-light text-center"
          >
            {t('viewBookings')}
          </Link>
          <Link
            to="/"
            className="block w-full py-3 rounded-sm bg-secondary text-secondary-foreground font-light text-center"
          >
            {t('backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  if (showPaymentQR) {
    return (
      <div className="px-6 pt-16 pb-6">
        <button onClick={() => setShowPaymentQR(false)} className="flex items-center gap-2 text-muted-foreground mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> {t('back')}
        </button>
        <PromptPayQR
          amount={service?.price}
          onPaymentConfirmed={() => createBookingMutation.mutate()}
        />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="px-6 pt-24 pb-6 space-y-8 text-center">
        <h2 className="font-display text-2xl font-light">{t('bookNow')}</h2>
        <p className="text-muted-foreground text-sm">กรุณาเข้าสู่ระบบด้วย LINE เพื่อจองคิว</p>
        <LineLoginButton />
      </div>
    );
  }

  return (
    <div className="px-6 pt-16 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
          className="p-2 hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-light text-foreground">{serviceName}</h1>
          {service && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Clock className="w-3 h-3" />
              <span>{service.duration_minutes} min</span>
              <span>•</span>
              <span className="text-foreground">฿{service.price?.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-10">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-0.5 flex-1 transition-colors ${
              i <= step ? 'bg-foreground' : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && (
            <TherapistPicker
              therapists={therapists}
              selected={selectedTherapist}
              onSelect={setSelectedTherapist}
            />
          )}
          {step === 1 && (
            <TimeSlotPicker
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              selectedTime={selectedTime}
              onTimeSelect={setSelectedTime}
              bookedSlots={bookedSlots}
              duration={service?.duration_minutes}
            />
          )}
          {step === 2 && (
            <PaymentMethodPicker
              selected={paymentMethod}
              onSelect={setPaymentMethod}
            />
          )}
          {step === 3 && (
           <div className="space-y-6">
             <h3 className="font-display text-lg font-light text-foreground">{t('bookingSummary')}</h3>
             <div className="bg-card border border-border rounded-sm p-6 space-y-4">
               <SummaryRow label={t('service')} value={serviceName} />
               <SummaryRow label={t('therapist')} value={selectedTherapist?.nickname || t('anyTherapist')} />
               <SummaryRow
                 label={t('date')}
                 value={selectedDate ? format(selectedDate, 'd MMM', { locale }) : ''}
               />
               <SummaryRow label={t('time')} value={selectedTime} />
               <SummaryRow label={t('duration')} value={`${service?.duration_minutes} min`} />
               <SummaryRow label={t('paymentMethod')} value={t(paymentMethod)} />
               <div className="border-t border-border pt-4 flex justify-between">
                 <span className="font-light text-foreground">{t('total')}</span>
                 <span className="text-lg text-foreground">
                   ฿{service?.price?.toLocaleString()}
                 </span>
               </div>
             </div>
           </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom action */}
      <div className="fixed bottom-20 left-0 right-0 px-6 max-w-lg mx-auto">
        <Button
          onClick={handleNext}
          disabled={!canProceed() || createBookingMutation.isPending}
          className="w-full h-12 rounded-sm bg-primary text-primary-foreground font-light text-base"
        >
          {step === STEPS.length - 1
            ? t('confirmBooking')
            : t('next')
          }
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground font-light">{label}</span>
      <span className="text-foreground font-light">{value}</span>
    </div>
  );
}