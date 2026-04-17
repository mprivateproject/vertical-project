import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { useTheme } from '@/lib/ThemeContext';
import { Link } from 'react-router-dom';
import {
  Clock, Star, Award, Settings, Moon, Sun, Globe, LogOut,
  ChevronRight, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import LanguageToggle from '@/components/shared/LanguageToggle';
import LineLoginButton from '@/components/customer/LineLoginButton';

export default function Profile() {
  const { t, lang } = useLang();
  const { lineProfile, customer, isLoggedIn, logout } = useLine();
  const { isDark, toggleTheme } = useTheme();

  if (!isLoggedIn) {
    return (
      <div className="px-6 pt-24 pb-6 space-y-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
          <Shield className="w-7 h-7 text-muted-foreground" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-light text-foreground">{t('profile')}</h2>
          <p className="text-muted-foreground text-sm mt-2">
            {lang === 'th' ? 'กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์' : 'Please login to view your profile'}
          </p>
        </div>
        <LineLoginButton />
      </div>
    );
  }

  const menuItems = [
    { icon: Clock, label: t('bookingHistory'), path: '/bookings' },
    { icon: Star, label: t('review'), path: '/bookings' },
    { icon: Award, label: `${t('loyalty')} — 0 ${t('points')}`, path: '/bookings' },
  ];

  return (
    <div className="px-6 pt-16 pb-6 space-y-8">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        {lineProfile.pictureUrl ? (
          <img
            src={lineProfile.pictureUrl}
            alt={lineProfile.displayName}
            className="w-24 h-24 rounded-full mx-auto border-2 border-border object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full mx-auto border-2 border-border bg-secondary flex items-center justify-center">
            <span className="text-3xl font-light text-muted-foreground">
              {lineProfile.displayName?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        )}
        <div>
          <h2 className="font-display text-2xl font-light text-foreground">{lineProfile.displayName}</h2>
          {lineProfile.email && (
            <p className="text-sm text-muted-foreground mt-1">{lineProfile.email}</p>
          )}
        </div>
      </motion.div>

      {/* Membership card */}
      <div className="bg-card border border-border rounded-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{t('membership')}</p>
            <p className="font-display text-lg font-light text-foreground mt-1 capitalize">
              {customer?.membership_tier === 'none' ? 'Member' : `${customer?.membership_tier} Member`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{t('loyalty')}</p>
            <p className="font-display text-lg font-light text-foreground mt-1">{customer?.loyalty_points || 0}</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="space-y-2">
        {menuItems.map(({ icon: Icon, label, path }, i) => (
          <Link
            key={i}
            to={path}
            className="flex items-center gap-3 p-4 border border-border hover:bg-secondary transition-colors"
          >
            <Icon className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-foreground font-light">{label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      {/* Settings */}
      <div className="space-y-2 pt-4 border-t border-border">
        <div className="flex items-center justify-between p-4 border border-border">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-foreground font-light">
              {lang === 'th' ? 'ภาษา' : 'Language'}
            </span>
          </div>
          <LanguageToggle />
        </div>
        
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full p-4 border border-border hover:bg-secondary transition-colors"
        >
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
            <span className="text-sm text-foreground font-light">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-3 w-full p-4 border border-destructive/30 hover:bg-destructive/5 transition-colors text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-light">
            {lang === 'th' ? 'ออกจากระบบ' : 'Logout'}
          </span>
        </button>
      </div>

      {/* Admin/Staff links */}
      <div className="pt-6 border-t border-border space-y-2">
        <Link
          to="/staff"
          className="block text-center text-xs text-muted-foreground hover:text-foreground py-3 font-light"
        >
          {t('staffDashboard')} →
        </Link>
        <Link
          to="/admin"
          className="block text-center text-xs text-muted-foreground hover:text-foreground py-3 font-light"
        >
          {t('adminDashboard')} →
        </Link>
      </div>
    </div>
  );
}