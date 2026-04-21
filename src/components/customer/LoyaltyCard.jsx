import React from 'react';
import { Award, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/LanguageContext';

const E = [0.22, 1, 0.36, 1];

const TIER_COLORS = {
  none:     { bg: 'rgba(161,165,173,0.08)', border: 'rgba(161,165,173,0.2)',  accent: '#a1a5ad' },
  silver:   { bg: 'rgba(192,192,192,0.08)', border: 'rgba(192,192,192,0.25)', accent: '#c0c0c0' },
  gold:     { bg: 'rgba(212,175,55,0.12)',  border: 'rgba(212,175,55,0.35)',  accent: '#d4af37' },
  platinum: { bg: 'rgba(229,228,226,0.1)',  border: 'rgba(229,228,226,0.3)',  accent: '#e5e4e2' },
};

// Next tier thresholds — must match LoyaltyRewards page
const NEXT_TIER_POINTS = { none: 200, silver: 500, gold: 1500, platinum: null };
const NEXT_TIER_LABEL  = { none: 'Silver', silver: 'Gold', gold: 'Platinum', platinum: null };
const NEXT_TIER_LABEL_TH = { none: 'ซิลเวอร์', silver: 'โกลด์', gold: 'แพลตินัม', platinum: null };

export default function LoyaltyCard({ customer }) {
  const { lang } = useLang();
  const currentTierKey = customer?.membership_tier || 'none';
  const colors = TIER_COLORS[currentTierKey] || TIER_COLORS.none;
  const points = customer?.loyalty_points || 0;

  const nextPoints = NEXT_TIER_POINTS[currentTierKey];
  const nextLabel  = lang === 'th' ? NEXT_TIER_LABEL_TH[currentTierKey] : NEXT_TIER_LABEL[currentTierKey];
  const pointsToNext = nextPoints ? Math.max(0, nextPoints - points) : 0;
  const progressPercent = nextPoints ? Math.min(100, (points / nextPoints) * 100) : 100;

  const tierDisplayName = {
    none: 'Member', silver: 'Silver', gold: 'Gold', platinum: 'Platinum',
  }[currentTierKey] || 'Member';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: E }}
      className="rounded-2xl p-5 space-y-4"
      style={{
        background: `linear-gradient(135deg, ${colors.bg} 0%, rgba(255,255,255,0.02) 100%)`,
        border: `1px solid ${colors.border}`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: colors.accent + '20' }}
          >
            <Award className="w-5 h-5" style={{ color: colors.accent }} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground tracking-wide">{lang === 'th' ? 'ระดับสมาชิก' : 'Member Tier'}</p>
            <p className="font-semibold text-foreground capitalize">{tierDisplayName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums" style={{ color: colors.accent }}>
            {points.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">{lang === 'th' ? 'คะแนน' : 'points'}</p>
        </div>
      </div>

      {/* Progress bar */}
      {nextPoints && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {lang === 'th' ? `ถัดไป: ${nextLabel}` : `Next: ${nextLabel}`}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {pointsToNext.toLocaleString()} {lang === 'th' ? 'คะแนน' : 'pts'}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: E }}
              className="h-full rounded-full"
              style={{ background: colors.accent }}
            />
          </div>
        </div>
      )}
      {!nextPoints && (
        <p className="text-xs" style={{ color: colors.accent }}>✦ {lang === 'th' ? 'ระดับสูงสุด' : 'Highest Tier'}</p>
      )}
    </motion.div>
  );
}