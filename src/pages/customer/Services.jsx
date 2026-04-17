import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
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
    queryFn: () => base44.entities.Service.filter({ is_active: true }, 'sort_order', 100),
  });

  const filtered = services.filter(s => {
    const catMatch = category === 'all' || s.category === category;
    const name = lang === 'th' ? s.name_th : s.name_en;
    const searchMatch = !searchQuery || name?.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && searchMatch;
  });

  return (
    <div className="px-6 pt-16 pb-20 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-light text-foreground tracking-tight">
          {t('selectService')}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">Curated treatments for your wellness</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t('search') + '...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 rounded-sm bg-secondary border-0 h-12 text-sm"
        />
      </div>

      {/* Categories */}
      <CategoryFilter selected={category} onSelect={setCategory} />

      {/* Services grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-56 rounded-sm bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          ไม่พบบริการที่ค้นหา
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {filtered.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}