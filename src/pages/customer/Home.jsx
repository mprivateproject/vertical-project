import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import HeroSection from '@/components/customer/HeroSection';
import ServiceCard from '@/components/customer/ServiceCard';
import CategoryFilter from '@/components/customer/CategoryFilter';
import LineLoginButton from '@/components/customer/LineLoginButton';

export default function Home() {
  const { t } = useLang();
  const { isLoggedIn } = useLine();
  const [category, setCategory] = useState('all');

  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.filter({ is_active: true }, 'sort_order', 50),
  });

  const filteredServices = category === 'all'
    ? services
    : services.filter(s => s.category === category);

  const popularServices = services.filter(s => s.is_popular);

  return (
    <div className="bg-background min-h-screen">
      <HeroSection />

      <div className="px-6 pt-8 pb-28 space-y-10">

        {/* LINE Login prompt */}
        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <LineLoginButton />
          </motion.div>
        )}

        {/* Book Now CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Link
            to="/services"
            className="flex items-center justify-between w-full px-6 py-5 rounded-xl bg-foreground text-background active:scale-[0.98] transition-transform duration-150"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
          >
            <div>
              <p className="font-semibold text-[15px] tracking-tight">{t('bookNow')}</p>
              <p className="text-background/50 text-[12px] mt-0.5 font-light tracking-wide">
                {t('selectService')}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 opacity-60" />
          </Link>
        </motion.div>

        {/* Popular services */}
        {popularServices.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-[13px] font-semibold text-foreground tracking-[0.12em] uppercase">
                {t('popular')}
              </h2>
              <Link to="/services" className="text-[11px] text-muted-foreground tracking-wide hover:text-foreground transition-colors">
                {t('all')} →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {popularServices.slice(0, 4).map((service, i) => (
                <ServiceCard key={service.id} service={service} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* All services */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-[13px] font-semibold text-foreground tracking-[0.12em] uppercase">
              {t('services')}
            </h2>
          </div>

          <CategoryFilter selected={category} onSelect={setCategory} />

          {loadingServices ? (
            <div className="grid grid-cols-2 gap-3 mt-5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-52 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-5">
              {filteredServices.map((service, i) => (
                <ServiceCard key={service.id} service={service} index={i} />
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}