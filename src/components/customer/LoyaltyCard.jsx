import React from 'react';
import { Award, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/LanguageContext';

const E = [0.22, 1, 0.36, 1];

const TIER_COLORS = {
  none: { bg: 'rgba(161,165,173,0.08)', border: 'rgba(161,165,173,0.2)', accent: '#a1a5ad' },
  silver: { bg: 'rgba(192,192,192,0.08)', border: 'rgba(192,192,192,0.25)', accent: '#c0c0c0' },
  gold: { bg: 'rgba(212,175,55,0.12)', border: 'rgba(212,175,55,0.35)', accent: '#d4af37' },
  platinum: { bg: 'rgba(229,228,226,0.1)', border: 'rgba(229,228,226,0.3)', accent: '#e5e4e2' },
};

export default function LoyaltyCard({ customer, tier }) {
  const { lang } = useLang();
  const tierName = lang === 'th' ? tier?.name_th : tier?.name_en;
  const colors = TIER_COLORS[customer?.membership_tier] || TIER_COLORS.none;
  
  const nextTier = !tier || customer?.membership_tier === 'platinum' ? null : tier;
  const pointsToNext = nextTier ? Math.max(0, nextTier.min_points - (customer?.loyalty_points || 0)) : 0;
  const progressPercent = nextTier ? Math.min(100, ((customer?.loyalty_points || 0) / nextTier.min_points) * 100) : 100;

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
            <p className="text-xs text-muted-foreground tracking-wide">{lang === 'th' ? 'สมาชิก' : 'Member Tier'}</p>
            <p className="font-semibold text-foreground capitalize">{tierName || 'Member'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums" style={{ color: colors.accent }}>
            {customer?.loyalty_points || 0}
          </p>
          <p className="text-xs text-muted-foreground">{lang === 'th' ? 'แต้ม' : 'points'}</p>
        </div>
      </div>

      {/* Progress bar */}
      {nextTier && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {lang === 'th' ? 'ถัดไป' : 'Next tier'}: {lang === 'th' ? nextTier.name_th : nextTier.name_en}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {pointsToNext} {lang === 'th' ? 'แต้ม' : 'pts'}
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

      {/* Benefits list */}
      {tier?.benefits_en && tier.benefits_en.length > 0 && (
        <div className="pt-2 space-y-1.5 border-t border-border/30">
          <p className="text-xs font-medium text-foreground mb-2">
            {lang === 'th' ? 'สิทธิประโยชน์' : 'Benefits'}
          </p>
          {(lang === 'th' ? tier.benefits_th : tier.benefits_en).slice(0, 3).map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex items-start gap-2 text-xs text-muted-foreground"
            >
              <Zap className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: colors.accent }} />
              <span>{benefit}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Earning info */}
      {tier?.points_multiplier > 1 && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-xs text-foreground">
            {lang === 'th' ? `ได้แต้มมากขึ้น ${(tier.points_multiplier * 100 - 100).toFixed(0)}%` : `Earn ${(tier.points_multiplier * 100 - 100).toFixed(0)}% more points`}
          </span>
        </div>
      )}
    </motion.div>
  );
}