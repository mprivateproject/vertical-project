import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import QuickBooking from '@/components/customer/QuickBooking';

export default function QuickBookingPage() {
  const { lang } = useLang();

  return (
    <div className="min-h-screen bg-background pb-32 pt-6 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            {lang === 'th' ? 'Reserve Your Session' : 'Reserve Your Session'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === 'th' ? 'เลือกบริการและเวลาที่ต้องการ' : 'Select your service and preferred time'}
          </p>
        </div>
        <QuickBooking />
      </div>
    </div>
  );
}