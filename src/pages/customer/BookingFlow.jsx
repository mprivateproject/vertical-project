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
    queryFn: () => {
      if (!selectedDate) return [];
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      return base44.entities.Booking.filter({ booking_date: dateStr });
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
      const endMinutes = (() => {
        const [h, m] = selectedTime.split(':').map(Number);
        const total = h * 60 + m + (service?.duration_minutes || 60);
        return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
      })();

      return base44.entities.Booking.create({
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
      });
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
      <div className="px-5 pt-20 pb-6 text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center"
        >
          <Check className="w-10 h-10 text-primary" />
        </motion.div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            {t('bookingConfirmed')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {serviceName} • {selectedDate && format(selectedDate, 'd MMM', { locale })} • {selectedTime}
          </p>
        </div>
        <div className="space-y-3 pt-4">
          <Link
            to="/bookings"
            className="block w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-center"
          >
            {t('viewBookings')}
          </Link>
          <Link
            to="/"
            className="block w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-center"
          >
            {t('backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  if (showPaymentQR) {
    return (
      <div className="px-5 pt-14 pb-6">
        <button onClick={() => setShowPaymentQR(false)} className="flex items-center gap-2 text-muted-foreground mb-6">
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
      <div className="px-5 pt-20 pb-6 space-y-6 text-center">
        <h2 className="font-display text-xl font-semibold">{t('bookNow')}</h2>
        <p className="text-muted-foreground text-sm">กรุณาเข้าสู่ระบบด้วย LINE เพื่อจองคิว</p>
        <LineLoginButton />
      </div>
    );
  }

  return (
    <div className="px-5 pt-14 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground">{serviceName}</h1>
          {service && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <Clock className="w-3 h-3" />
              <span>{service.duration_minutes} {t('minutes')}</span>
              <span>•</span>
              <span className="font-medium text-primary">฿{service.price?.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-primary' : 'bg-border'
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
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">{t('bookingSummary')}</h3>
              <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <SummaryRow label={t('service')} value={serviceName} />
                <SummaryRow label={t('therapist')} value={selectedTherapist?.nickname || t('anyTherapist')} />
                <SummaryRow
                  label={t('date')}
                  value={selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale }) : ''}
                />
                <SummaryRow label={t('time')} value={selectedTime} />
                <SummaryRow label={t('duration')} value={`${service?.duration_minutes} ${t('minutes')}`} />
                <SummaryRow label={t('paymentMethod')} value={t(paymentMethod)} />
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-semibold text-foreground">{t('total')}</span>
                  <span className="font-bold text-lg text-primary">
                    ฿{service?.price?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom action */}
      <div className="fixed bottom-20 left-0 right-0 px-5 max-w-lg mx-auto">
        <Button
          onClick={handleNext}
          disabled={!canProceed() || createBookingMutation.isPending}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-lg shadow-primary/20"
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
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}