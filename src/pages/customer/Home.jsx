import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { liffSyncClient } from '@/lib/liffSyncClient';
import { useLine } from '@/lib/LineContext';
import { motion } from 'framer-motion';
import HomeHeader from '@/components/home/HomeHeader';
import ActionCards from '@/components/home/ActionCards';
import PromotionsSection from '@/components/home/PromotionsSection';
import ServicesSection from '@/components/home/ServicesSection';
import LineLoginButton from '@/components/customer/LineLoginButton';

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
        data: { action: 'getMyBookings' },
      });
      return r.bookings || [];
    },
    enabled: !!ready && !!isLoggedIn,
  });

  return (
    <div className="min-h-screen" style={{ background: '#0E0F11' }}>
      {/* Ambient gradient */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(198,200,204,0.05) 0%, rgba(14,15,17,0) 65%)',
      }} />
      {/* Noise */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      <div className="relative z-10 pb-36">
        {/* 1. Header */}
        <HomeHeader />

        {/* LINE Login prompt */}
        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="px-5 mb-6"
          >
            <LineLoginButton />
          </motion.div>
        )}

        {/* 2. Action Cards 2x2 */}
        <div className="mb-8">
          <ActionCards totalBookings={myBookings.length} />
        </div>

        {/* 3. Promotions */}
        <div className="mb-8">
          <PromotionsSection promotions={promoData} isLoading={promoLoading} />
        </div>

        {/* 4. Services */}
        <div className="mb-4">
          <ServicesSection services={servicesData} isLoading={servicesLoading} />
        </div>
      </div>
    </div>
  );
}