import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
import { liffSyncClient } from '@/lib/liffSyncClient';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ServiceCard from '@/components/customer/ServiceCard';
import CategoryFilter from '@/components/customer/CategoryFilter';

export default function Services() {
  const { t, lang } = useLang();
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const result = await liffSyncClient.call({ url: '/functions/liffSync', method: 'POST', data: { action: 'getServices' } });
      return result.services || [];
    },
  });

  const filtered = services.filter(s => {
    const catMatch = category === 'all' || s.category === category;
    const name = lang === 'th' ? s.name_th : s.name_en;
    const searchMatch = !searchQuery || name?.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && searchMatch;
  });

  return (
    <div className="px-5 pt-4 pb-6 space-y-5" style={{ marginTop: '-32px', position: 'relative', zIndex: 10 }}>
      <h1 className="font-display text-2xl font-semibold text-foreground">
        {t('selectService')}
      </h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t('search') + '...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 rounded-xl bg-secondary border-0 h-11"
        />
      </div>

      {/* Categories */}
      <CategoryFilter selected={category} onSelect={setCategory} />

      {/* Services grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-52 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          ไม่พบบริการที่ค้นหา
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}