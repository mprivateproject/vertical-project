import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, Loader2 } from 'lucide-react';

export default function AdminAuthGuard({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'authorized' | 'unauthorized'

  useEffect(() => {
    // Try a simple admin-only operation to check if user has admin role
    base44.entities.User.list()
      .then(() => setStatus('authorized'))
      .catch(() => setStatus('unauthorized'));
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
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