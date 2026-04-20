import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminAuthGuard({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'authorized' | 'unauthorized' | 'unauthenticated'

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) {
        window.location.href = '/admin-login';
        return;
      }
      // Try admin-only operation to verify role
      base44.entities.User.list()
        .then(() => setStatus('authorized'))
        .catch(() => setStatus('unauthorized'));
    });
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <LogIn className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Admin Login Required</h2>
          <p className="text-sm text-muted-foreground">กรุณาล็อกอินเพื่อเข้าถึงหน้าแอดมิน</p>
        </div>
        <Button
          onClick={() => base44.auth.redirectToLogin(window.location.href)}
          className="gap-2 px-6"
        >
          <LogIn className="w-4 h-4" />
          ล็อกอิน
        </Button>
      </div>
    );
  }

  if (status === 'unauthorized') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-6">
        <Shield className="w-12 h-12 text-muted-foreground opacity-40" />
        <h2 className="text-lg font-semibold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
      </div>
    );
  }

  return children;
}