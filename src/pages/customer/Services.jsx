import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';
import { liffSyncClient } from '@/lib/liffSyncClient';
import { Search } from 'lucide-react';
import ServiceCard from '@/components/customer/ServiceCard';
import CategoryFilter from '@/components/customer/CategoryFilter';

export default function Services() {
  const { t, lang } = useLang();
  const { isDark } = useTheme();
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

  const bg = isDark ? '#0E0F11' : '#FFFFFF';
  const labelColor = isDark ? 'rgba(161,165,173,0.4)' : 'rgba(120,110,100,0.55)';
  const titleColor = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(40,35,30,0.92)';
  const iconColor = isDark ? 'rgba(161,165,173,0.35)' : 'rgba(120,110,100,0.4)';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const inputBorder = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)';
  const inputText = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(40,35,30,0.85)';
  const emptyStateColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(120,110,100,0.6)';
  const skeletonBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
  const skeletonBorder = isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)';

  return (
    <div
      className="min-h-screen pb-32"
      style={{ background: bg, marginTop: '-32px', position: 'relative', zIndex: 10 }}
    >
      <div className="px-5 pt-5 space-y-5">
        {/* Header */}
         <div>
           <p
             className="text-[11px] font-semibold tracking-[0.35em] uppercase mb-1"
             style={{ color: labelColor, fontFamily: 'var(--font-body)' }}
           >
             — OUR PROGRAMS —
           </p>
           <h1
             className="text-sm font-light tracking-wide"
             style={{ color: titleColor, fontFamily: 'var(--font-body)', letterSpacing: '0.03em' }}
           >
             {lang === 'th' ? 'เลือกโปรแกรม' : 'Select Program'}
           </h1>
         </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            style={{ color: iconColor }}
          />
          <input
            placeholder={lang === 'th' ? 'ค้นหาโปรแกรม...' : 'Search programs...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-2xl text-[16px] outline-none transition-all"
            style={{
              background: inputBg,
              border: inputBorder,
              color: inputText,
              fontFamily: 'var(--font-body)',
            }}
          />
        </div>

        {/* Categories */}
        <CategoryFilter selected={category} onSelect={setCategory} />

        {/* Services grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4,5,6].map(i => (
              <div
                key={i}
                className="h-52 rounded-2xl animate-pulse"
                style={{ background: skeletonBg, border: skeletonBorder }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <p
              className="text-[18px] font-light"
              style={{ color: emptyStateColor, fontFamily: 'var(--font-body)' }}
            >
              {lang === 'th' ? 'ไม่พบโปรแกรมที่ค้นหา' : 'No programs found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}