import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';
import { liffSyncClient } from '@/lib/liffSyncClient';
import { Search, Sparkles } from 'lucide-react';
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

  const bg = isDark ? '#0E0F11' : '#F8F6F2';
  const labelColor = isDark ? 'rgba(182,188,199,0.55)' : 'rgba(120,110,100,0.62)';
  const titleColor = isDark ? 'rgba(255,255,255,0.94)' : 'rgba(35,30,24,0.96)';
  const subtitleColor = isDark ? 'rgba(210,214,222,0.62)' : 'rgba(89,78,67,0.72)';
  const iconColor = isDark ? 'rgba(198,203,212,0.42)' : 'rgba(120,110,100,0.5)';
  const panelBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.72)';
  const panelBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(38,30,20,0.08)';
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)';
  const inputBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(38,30,20,0.1)';
  const inputText = isDark ? 'rgba(255,255,255,0.88)' : 'rgba(40,35,30,0.92)';
  const emptyStateColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(108,95,82,0.72)';
  const skeletonBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.82)';
  const skeletonBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(38,30,20,0.08)';

  return (
    <div
      className="min-h-screen pb-32"
      style={{ background: bg, marginTop: '-32px', position: 'relative', zIndex: 10 }}
    >
      <div className="px-5 pt-5 space-y-4">
        <div className="space-y-1.5">
           <p
             className="text-[11px] font-semibold tracking-[0.32em] uppercase"
             style={{ color: labelColor, fontFamily: 'var(--font-body)' }}
           >
             — OUR PROGRAMS —
           </p>
           <h1
             className="text-[22px] leading-tight tracking-tight"
             style={{ color: titleColor, fontFamily: 'var(--font-body)', letterSpacing: '0.03em' }}
           >
             {lang === 'th' ? 'เลือกโปรแกรม' : 'Select Program'}
           </h1>
           <p
             className="text-[14px]"
             style={{ color: subtitleColor, fontFamily: 'var(--font-body)' }}
           >
             {lang === 'th'
               ? 'ค้นหาโปรแกรมที่ใช่สำหรับคุณในบรรยากาศที่ผ่อนคลาย'
               : 'Find the right program for your day and mood.'}
           </p>
         </div>

        <div
          className="rounded-3xl p-3.5 space-y-3"
          style={{
            background: panelBg,
            border: panelBorder,
            boxShadow: isDark ? '0 12px 28px rgba(0,0,0,0.28)' : '0 10px 24px rgba(41,28,15,0.08)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: iconColor }}
            />
            <input
              placeholder={lang === 'th' ? 'ค้นหาโปรแกรม...' : 'Search programs...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-2xl text-[15px] outline-none transition-all"
              style={{
                background: inputBg,
                border: inputBorder,
                color: inputText,
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          <CategoryFilter selected={category} onSelect={setCategory} />
        </div>

        <div className="flex items-center justify-between px-0.5">
          <p className="text-[12px] uppercase tracking-[0.18em]" style={{ color: labelColor }}>
            {lang === 'th' ? 'รายการที่พร้อมให้บริการ' : 'Available Programs'}
          </p>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
              border: panelBorder,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: iconColor }} />
            <span className="text-[12px]" style={{ color: subtitleColor }}>
              {filtered.length}
            </span>
          </div>
        </div>

        {/* Services grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1,2,3,4,5,6].map(i => (
              <div
                key={i}
                className="h-52 rounded-2xl animate-pulse"
                style={{ background: skeletonBg, border: skeletonBorder }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-2 rounded-3xl" style={{ background: panelBg, border: panelBorder }}>
            <p
              className="text-[18px] font-medium"
              style={{ color: emptyStateColor, fontFamily: 'var(--font-body)' }}
            >
              {lang === 'th' ? 'ไม่พบโปรแกรมที่ค้นหา' : 'No programs found'}
            </p>
            <p className="text-[13px]" style={{ color: subtitleColor }}>
              {lang === 'th' ? 'ลองค้นหาด้วยคำที่สั้นลงหรือเปลี่ยนหมวดหมู่' : 'Try a different category or simpler keyword.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}