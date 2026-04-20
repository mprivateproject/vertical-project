import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated, if so redirect to admin
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) {
        window.location.href = '/admin';
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handleLogin = () => {
    base44.auth.redirectToLogin('/admin');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#0E0F11' }}>
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: '#0E0F11' }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(198,168,76,0.06) 0%, transparent 60%)',
      }} />

      <div
        className="relative flex flex-col items-center gap-8 px-10 py-12 rounded-3xl w-full max-w-sm mx-4"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Logo / Brand */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <span className="text-2xl font-bold tracking-tight" style={{ color: 'rgba(220,190,100,0.9)', fontFamily: 'Georgia, serif' }}>M</span>
          </div>
          <div className="text-center">
            <p className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(161,165,173,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
              Admin
            </p>
            <h1 className="text-xl font-light" style={{ color: 'rgba(255,255,255,0.88)', fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}>
              Vertical Project
            </h1>
          </div>
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-medium text-[14px] tracking-wide transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #06C755 0%, #05A847 100%)',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(6,199,85,0.3)',
          }}
        >
          {/* LINE icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
          เข้าสู่ระบบด้วย LINE
        </button>

        <p className="text-[11px] text-center" style={{ color: 'rgba(161,165,173,0.3)' }}>
          สำหรับผู้ดูแลระบบเท่านั้น
        </p>
      </div>
    </div>
  );
}