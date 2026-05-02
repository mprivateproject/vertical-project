import React, { useState, useEffect } from 'react';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { useTheme } from '@/lib/ThemeContext';
import { Link } from 'react-router-dom';
import {
  Clock, Moon, Sun, Globe, LogOut,
  ChevronRight, Shield, Sliders, LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';
import LanguageToggle from '@/components/shared/LanguageToggle';
import LineLoginButton from '@/components/customer/LineLoginButton';
import { base44 } from '@/api/base44Client';

export default function Profile() {
  const { t, lang } = useLang();
  const { lineProfile, customer, isLoggedIn, logout, ready } = useLine();
  const { isDark, toggleTheme } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.role === 'admin') setIsAdmin(true);
    }).catch(() => {});
  }, []);

  if (!isLoggedIn || !lineProfile) {
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
    { icon: Clock, label: lang === 'th' ? 'บุ้คกิ้งของคุณ' : 'Your Bookings', path: '/bookings' },
    { icon: Sliders, label: lang === 'th' ? 'Preference & Special Requests' : 'Preference & Special Requests', path: '/preferences' },
  ];

  return (
    <div className="px-5 pt-14 pb-6 space-y-6">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        {lineProfile.pictureUrl ? (
          <img
            src={lineProfile.pictureUrl}
            alt={lineProfile.displayName}
            className="w-20 h-20 rounded-full mx-auto border-4 border-primary/10 object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full mx-auto border-4 border-primary/10 bg-secondary flex items-center justify-center">
            <span className="text-2xl font-bold text-muted-foreground">
              {lineProfile.displayName?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        )}
        <div>
          <h2 className="font-semibold text-lg text-foreground">{lineProfile.displayName}</h2>
          <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-medium mt-1 ${
            customer?.is_invited_member
              ? 'bg-primary/10 text-primary'
              : 'bg-secondary text-muted-foreground'
          }`}>
            {customer?.is_invited_member ? '✦ Invited Member' : 'Member'}
          </span>
        </div>
      </motion.div>

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

        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors border border-primary/20 mt-2"
          >
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <span className="flex-1 text-sm text-primary font-medium">
              {lang === 'th' ? 'Admin Dashboard' : 'Admin Dashboard'}
            </span>
            <ChevronRight className="w-4 h-4 text-primary/60" />
          </Link>
        )}
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


    </div>
  );
}