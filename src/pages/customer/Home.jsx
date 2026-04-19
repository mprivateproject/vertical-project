import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { liffSyncClient } from '@/lib/liffSyncClient';
import { useLine } from '@/lib/LineContext';
import HomeHeader from '@/components/home/HomeHeader';
import ActionCards from '@/components/home/ActionCards';
import PromotionsSection from '@/components/home/PromotionsSection';
import ServicesSection from '@/components/home/ServicesSection';

export default function Home() {
  const { isLoggedIn, ready } = useLine();

  const { data: promoData, isLoading: promoLoading } = useQuery({
    queryKey: ['home-promotions'],
    queryFn: async () => {
      const r = await liffSyncClient.call({
        url: '/functions/liffSync', method: 'POST',
        data: { action: 'getPromotions' },
      });
      return r.promotions || [];
    },
  });

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['home-services'],
    queryFn: async () => {
      const r = await liffSyncClient.call({
        url: '/functions/liffSync', method: 'POST',
        data: { action: 'getServices' },
      });
      return r.services || [];
    },
  });

  const { data: myBookings = [] } = useQuery({
    queryKey: ['my-bookings-count'],
    queryFn: async () => {
      const r = await liffSyncClient.call({
        url: '/functions/liffSync', method: 'POST',
        data: { action: 'getBookings' },
      });
      return r.bookings || [];
    },
    enabled: !!ready && !!isLoggedIn,
  });

  return (
    <div className="min-h-screen" style={{ background: '#0E0F11' }}>
      {/* Ambient top glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% -5%, rgba(201,168,76,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 pb-36 space-y-5">
        {/* 1. Header — centered Hello */}
        <HomeHeader />

        {/* 2. Action Cards 2×2 */}
        <ActionCards totalBookings={myBookings.length} />

        {/* 3. Promotion banner */}
        <PromotionsSection promotions={promoData} isLoading={promoLoading} />

        {/* 4. Spa photo strip */}
        <ServicesSection services={servicesData} isLoading={servicesLoading} />
      </div>
    </div>
  );
}