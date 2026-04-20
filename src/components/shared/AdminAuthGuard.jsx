import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminAuthGuard({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'authorized' | 'login_required' | 'unauthorized'

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        if (!user) {
          setStatus('login_required');
        } else if (user.role === 'admin') {
          setStatus('authorized');
        } else {
          setStatus('unauthorized');
        }
      })
      .catch(() => setStatus('login_required'));
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === 'login_required') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-6">
        <div className="p-3 rounded-full bg-secondary">
          <LogIn className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1">Login Required</h2>
          <p className="text-sm text-muted-foreground">กรุณาเข้าสู่ระบบเพื่อเข้าถึงแผงควบคุมผู้ดูแล</p>
        </div>
        <Button
          onClick={() => base44.auth.redirectToLogin('/admin')}
          className="gap-2"
        >
          <LogIn className="w-4 h-4" />
          Login
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