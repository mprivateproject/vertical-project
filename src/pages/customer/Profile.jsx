import React, { useState } from 'react';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { useTheme } from '@/lib/ThemeContext';
import { Link } from 'react-router-dom';
import {
  Clock, Star, Award, Moon, Sun, Globe, LogOut,
  ChevronRight, Shield, Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import LanguageToggle from '@/components/shared/LanguageToggle';
import LineLoginButton from '@/components/customer/LineLoginButton';

export default function Profile() {
  const { t, lang } = useLang();
  const { lineProfile, isLoggedIn, logout } = useLine();
  const { isDark, toggleTheme } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="px-5 pt-20 pb-6 space-y-6 text-center">
        <div className="w-20 h-20 rounded-full bg-secondary mx-auto flex items-center justify-center">
          <Shield className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-display text-xl font-semibold">{t('profile')}</h2>
        <p className="text-muted-foreground text-sm">
          {lang === 'th' ? 'กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์' : 'Please login to view your profile'}
        </p>
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
    <div className="px-5 pt-14 pb-6 space-y-6">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <img
          src={lineProfile.pictureUrl}
          alt={lineProfile.displayName}
          className="w-20 h-20 rounded-full mx-auto border-4 border-primary/10 object-cover"
        />
        <div>
          <h2 className="font-semibold text-lg text-foreground">{lineProfile.displayName}</h2>
          <p className="text-xs text-muted-foreground">{lineProfile.statusMessage}</p>
        </div>
      </motion.div>

      {/* Membership card */}
      <div className="bg-gradient-to-br from-primary/10 via-accent/20 to-secondary rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{t('membership')}</p>
            <p className="font-semibold text-foreground mt-0.5">Silver Member</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{t('loyalty')}</p>
            <p className="font-bold text-primary text-lg">250</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="space-y-1">
        {menuItems.map(({ icon: Icon, label, path }, i) => (
          <Link
            key={i}
            to={path}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
          >
            <Icon className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-foreground">{label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      {/* Settings */}
      <div className="space-y-1 pt-2 border-t border-border">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {lang === 'th' ? 'ภาษา' : 'Language'}
            </span>
          </div>
          <LanguageToggle />
        </div>
        
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-secondary transition-colors"
        >
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
            <span className="text-sm text-foreground">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-destructive/5 transition-colors text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">
            {lang === 'th' ? 'ออกจากระบบ' : 'Logout'}
          </span>
        </button>
      </div>

      {/* Security section */}
      <div className="pt-2 border-t border-border space-y-1">
        <p className="px-3 pt-1 pb-1 text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
          {lang === 'th' ? 'ความปลอดภัย' : 'Security'}
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-destructive/5 transition-colors text-destructive"
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-sm font-medium">
              {lang === 'th' ? 'ลบบัญชี' : 'Delete Account'}
            </span>
          </button>
        ) : (
          <div className="p-3 rounded-xl bg-destructive/5 space-y-3">
            <p className="text-sm text-destructive font-medium">
              {lang === 'th' ? 'ยืนยันการลบบัญชี?' : 'Confirm account deletion?'}
            </p>
            <p className="text-xs text-muted-foreground">
              {lang === 'th' ? 'การกระทำนี้ไม่สามารถย้อนกลับได้' : 'This action cannot be undone.'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-foreground"
              >
                {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button
                onClick={() => { logout(); }}
                className="flex-1 py-2 rounded-lg bg-destructive text-white text-sm font-medium"
              >
                {lang === 'th' ? 'ลบบัญชี' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin/Staff links */}
      <div className="pt-4 border-t border-border space-y-2">
        <Link
          to="/staff"
          className="block text-center text-xs text-muted-foreground hover:text-foreground py-2"
        >
          {t('staffDashboard')} →
        </Link>
        <Link
          to="/admin"
          className="block text-center text-xs text-muted-foreground hover:text-foreground py-2"
        >
          {t('adminDashboard')} →
        </Link>
      </div>
    </div>
  );
}