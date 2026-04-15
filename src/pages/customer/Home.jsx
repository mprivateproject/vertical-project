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
import PromotionBanner from '@/components/customer/PromotionBanner';
import LineLoginButton from '@/components/customer/LineLoginButton';

export default function Home() {
  const { t } = useLang();
  const { isLoggedIn } = useLine();
  const [category, setCategory] = useState('all');

  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.filter({ is_active: true }, 'sort_order', 50),
  });

  const { data: promotions = [] } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => base44.entities.Promotion.filter({ is_active: true }),
  });

  const filteredServices = category === 'all'
    ? services
    : services.filter(s => s.category === category);

  const popularServices = services.filter(s => s.is_popular);

  return (
    <div>
      <HeroSection />

      <div className="px-5 -mt-4 relative z-10 space-y-6 pb-6">
        {/* LINE Login prompt */}
        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <LineLoginButton />
          </motion.div>
        )}

        {/* Quick book button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Link
            to="/services"
            className="flex items-center justify-between w-full p-4 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
          >
            <div>
              <p className="font-semibold text-base">{t('bookNow')}</p>
              <p className="text-primary-foreground/70 text-xs mt-0.5">
                {t('selectService')}
              </p>
            </div>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Promotions */}
        {promotions.length > 0 && (
          <div>
            <h2 className="font-semibold text-foreground mb-3">{t('promotions')}</h2>
            <PromotionBanner promotions={promotions} />
          </div>
        )}

        {/* Popular services */}
        {popularServices.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground">{t('popular')}</h2>
              <Link to="/services" className="text-xs text-primary font-medium">
                {t('all')} →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {popularServices.slice(0, 4).map((service, i) => (
                <ServiceCard key={service.id} service={service} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* All services */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">{t('services')}</h2>
          <CategoryFilter selected={category} onSelect={setCategory} />
          
          {loadingServices ? (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-52 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {filteredServices.map((service, i) => (
                <ServiceCard key={service.id} service={service} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}