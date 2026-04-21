import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { liffSyncClient } from '@/lib/liffSyncClient';
import { motion } from 'framer-motion';
import { ChevronLeft, Gift, Star, Zap, Crown, Gem } from 'lucide-react';
import { Link } from 'react-router-dom';

const E = [0.22, 1, 0.36, 1];

const TIER_CONFIG = {
  none:     { label: 'Member',   color: 'rgba(161,165,173,0.6)',  bg: 'rgba(255,255,255,0.04)', icon: Star },
  silver:   { label: 'Silver',   color: 'rgba(192,200,210,0.9)',  bg: 'rgba(192,200,210,0.08)', icon: Star },
  gold:     { label: 'Gold',     color: 'rgba(212,175,80,0.95)',  bg: 'rgba(212,175,80,0.08)',  icon: Crown },
  platinum: { label: 'Platinum', color: 'rgba(180,160,220,0.95)', bg: 'rgba(180,160,220,0.08)', icon: Gem },
};

const MOCK_REWARDS = [
  {
    id: 1,
    title_th: 'ส่วนลด 10%',
    title_en: '10% Discount',
    desc_th: 'ส่วนลดสำหรับนัดหมายครั้งถัดไป',
    desc_en: 'Discount on your next session',
    points: 500,
    tier: 'silver',
    icon: '✦',
  },
  {
    id: 2,
    title_th: 'อัพเกรดฟรี 30 นาที',
    title_en: 'Free 30-min Upgrade',
    desc_th: 'เพิ่มเวลานวด 30 นาทีโดยไม่มีค่าใช้จ่าย',
    desc_en: 'Add 30 minutes to any session',
    points: 800,
    tier: 'silver',
    icon: '◈',
  },
  {
    id: 3,
    title_th: 'ครีมนวดพรีเมียม',
    title_en: 'Premium Massage Oil',
    desc_th: 'อัพเกรดน้ำมันนวดเป็นระดับพรีเมียม',
    desc_en: 'Upgrade to premium aromatherapy oil',
    points: 400,
    tier: 'none',
    icon: '❋',
  },
  {
    id: 4,
    title_th: 'นวดฟรี 1 ชั่วโมง',
    title_en: 'Free 1-Hour Session',
    desc_th: 'รับนวด House Signature ฟรี 1 ครั้ง',
    desc_en: 'Complimentary House Signature session',
    points: 2000,
    tier: 'gold',
    icon: '✸',
  },
  {
    id: 5,
    title_th: 'ชุดของขวัญ Spa',
    title_en: 'Luxury Spa Gift Set',
    desc_th: 'ชุดผลิตภัณฑ์บำรุงผิวระดับพรีเมียม',
    desc_en: 'Curated premium skincare gift set',
    points: 1500,
    tier: 'gold',
    icon: '⬡',
  },
  {
    id: 6,
    title_th: 'Private Session พิเศษ',
    title_en: 'Exclusive Private Session',
    desc_th: 'นวดส่วนตัวพร้อมแชมเปญและอโรมา',
    desc_en: 'Private session with champagne & aroma',
    points: 5000,
    tier: 'platinum',
    icon: '♛',
  },
];

const tierOrder = { none: 0, silver: 1, gold: 2, platinum: 3 };

export default function LoyaltyRewards() {
  const { lang } = useLang();
  const { customer } = useLine();

  const points = customer?.loyalty_points || 0;
  const currentTier = customer?.membership_tier || 'none';
  const tierCfg = TIER_CONFIG[currentTier] || TIER_CONFIG.none;
  const TierIcon = tierCfg.icon;

  // Next tier
  const tiers = ['none', 'silver', 'gold', 'platinum'];
  const tierIdx = tiers.indexOf(currentTier);
  const nextTier = tiers[tierIdx + 1] || null;
  const nextTierMin = { none: 200, silver: 500, gold: 1500, platinum: null };
  const progress = nextTierMin[currentTier]
    ? Math.min((points / nextTierMin[currentTier]) * 100, 100)
    : 100;

  return (
    <div className="min-h-screen pb-32" style={{ background: '#0E0F11' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(212,175,80,0.05) 0%, transparent 60%)' }} />

      <div className="relative z-10 px-5 pt-14 space-y-7">

        {/* Back + Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: E }}>
          <Link to="/profile" className="inline-flex items-center gap-1.5 mb-5"
            style={{ color: 'rgba(161,165,173,0.45)', fontFamily: 'Montserrat, sans-serif', fontSize: '10px', letterSpacing: '0.2em' }}>
            <ChevronLeft className="w-3.5 h-3.5" />
            {lang === 'th' ? 'กลับ' : 'BACK'}
          </Link>
          <p className="text-[9px] font-semibold tracking-[0.35em] uppercase mb-1"
            style={{ color: 'rgba(161,165,173,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
            — LOYALTY PROGRAM —
          </p>
          <h1 className="text-2xl font-light tracking-wide"
            style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Georgia, "Times New Roman", serif' }}>
            {lang === 'th' ? 'รางวัลสมาชิก' : 'Loyalty Rewards'}
          </h1>
        </motion.div>

        {/* Tier Card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5, ease: E }}
          className="rounded-2xl px-6 py-5"
          style={{
            background: `linear-gradient(145deg, ${tierCfg.bg} 0%, rgba(255,255,255,0.02) 100%)`,
            border: `1px solid ${tierCfg.color.replace('0.9', '0.15')}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[9px] tracking-[0.25em] uppercase mb-1"
                style={{ color: 'rgba(161,165,173,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
                {lang === 'th' ? 'ระดับปัจจุบัน' : 'Current Tier'}
              </p>
              <p className="text-[20px] font-light" style={{ color: tierCfg.color, fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}>
                {tierCfg.label}
              </p>
            </div>
            <TierIcon className="w-8 h-8 opacity-60" style={{ color: tierCfg.color }} />
          </div>

          <div className="mb-3">
            <div className="flex items-end justify-between mb-2">
              <span className="text-[28px] font-bold tabular-nums" style={{ color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.02em' }}>
                {points.toLocaleString()}
              </span>
              <span className="text-[10px] tracking-[0.15em] uppercase mb-1.5" style={{ color: 'rgba(161,165,173,0.5)', fontFamily: 'Montserrat, sans-serif' }}>
                {lang === 'th' ? 'คะแนน' : 'points'}
              </span>
            </div>
            {nextTier && (
              <>
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                    transition={{ delay: 0.3, duration: 0.8, ease: E }}
                    className="h-full rounded-full"
                    style={{ background: tierCfg.color }}
                  />
                </div>
                <p className="text-[10px] mt-1.5" style={{ color: 'rgba(161,165,173,0.4)' }}>
                  {lang === 'th'
                    ? `อีก ${Math.max(0, nextTierMin[currentTier] - points).toLocaleString()} คะแนน สู่ระดับ ${TIER_CONFIG[nextTier]?.label}`
                    : `${Math.max(0, nextTierMin[currentTier] - points).toLocaleString()} pts to ${TIER_CONFIG[nextTier]?.label}`}
                </p>
              </>
            )}
            {!nextTier && (
              <p className="text-[10px] mt-1" style={{ color: tierCfg.color }}>
                {lang === 'th' ? '✦ ระดับสูงสุด' : '✦ Highest Tier'}
              </p>
            )}
          </div>
        </motion.div>

        {/* Rewards Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <p className="text-[9px] font-semibold tracking-[0.3em] uppercase mb-4"
            style={{ color: 'rgba(161,165,173,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
            {lang === 'th' ? 'รางวัลที่แลกได้' : 'Available Rewards'}
          </p>
          <div className="space-y-3">
            {MOCK_REWARDS.map((reward, i) => {
              const canRedeem = points >= reward.points && tierOrder[currentTier] >= tierOrder[reward.tier];
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.4, ease: E }}
                  className="flex items-center gap-4 px-4 py-4 rounded-2xl"
                  style={{
                    background: canRedeem ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                    border: canRedeem ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.05)',
                    opacity: canRedeem ? 1 : 0.45,
                  }}
                >
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl text-[18px]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {reward.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-light leading-snug"
                      style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Georgia, serif' }}>
                      {lang === 'th' ? reward.title_th : reward.title_en}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(161,165,173,0.5)' }}>
                      {lang === 'th' ? reward.desc_th : reward.desc_en}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[13px] font-semibold tabular-nums" style={{ color: canRedeem ? 'rgba(212,175,80,0.9)' : 'rgba(161,165,173,0.4)' }}>
                      {reward.points.toLocaleString()}
                    </p>
                    <p className="text-[9px] tracking-[0.1em]" style={{ color: 'rgba(161,165,173,0.3)', fontFamily: 'Montserrat, sans-serif' }}>
                      pts
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </div>
  );
}