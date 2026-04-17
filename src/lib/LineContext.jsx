import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

const LineContext = createContext();

export function LineProvider({ children }) {
  return <LineContext.Provider value={{}}>{children}</LineContext.Provider>;
}

// Hook ที่ใช้ทั่วแอป - ดึงข้อมูล Customer จาก DB และสร้างอัตโนมัติถ้ายังไม่มี
export function useLine() {
  const { user, isAuthenticated, isLoadingAuth, logout } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      syncCustomer(user);
    } else {
      setCustomer(null);
    }
  }, [isAuthenticated, user?.id]);

  const syncCustomer = async (authUser) => {
    setIsLoadingCustomer(true);
    try {
      // ใช้ user.id จาก Base44 เป็น line_user_id
      const lineUserId = authUser.id;
      const existing = await base44.entities.Customer.filter({ line_user_id: lineUserId });

      if (existing.length > 0) {
        // อัปเดตข้อมูลล่าสุด
        const updated = await base44.entities.Customer.update(existing[0].id, {
          display_name: authUser.full_name || existing[0].display_name,
          email: authUser.email || existing[0].email,
          picture_url: authUser.data?.pictureUrl || existing[0].picture_url,
        });
        setCustomer(updated);
      } else {
        // สร้าง Customer record ใหม่
        const created = await base44.entities.Customer.create({
          line_user_id: lineUserId,
          display_name: authUser.full_name || 'Guest',
          email: authUser.email || '',
          picture_url: authUser.data?.pictureUrl || '',
          preferred_language: 'th',
          total_visits: 0,
          total_spent: 0,
          loyalty_points: 0,
          membership_tier: 'none',
        });
        setCustomer(created);
      }
    } catch (err) {
      console.error('Failed to sync customer:', err);
    } finally {
      setIsLoadingCustomer(false);
    }
  };

  // lineProfile shape ที่ components เดิมใช้ (backward compatible)
  const lineProfile = user ? {
    lineUserId: user.id,
    displayName: user.full_name,
    pictureUrl: customer?.picture_url || user.data?.pictureUrl || null,
    statusMessage: user.data?.statusMessage || null,
    email: user.email || '',
    customerId: customer?.id || null,
  } : null;

  return {
    lineProfile,
    customer,
    isLoggedIn: isAuthenticated,
    isLoading: isLoadingAuth || isLoadingCustomer,
    loginWithLine: () => base44.auth.redirectToLogin(window.location.href),
    logout: () => logout(true),
  };
}