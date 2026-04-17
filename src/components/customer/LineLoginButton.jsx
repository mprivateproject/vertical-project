import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { Loader2 } from 'lucide-react';

export default function LineLoginButton() {
  const { t } = useLang();
  const { loginWithLine, isLoading } = useLine();

  return (
    <>
    <button
      onClick={loginWithLine}
      disabled={isLoading}
      className="flex items-center justify-center gap-3 w-full p-4 rounded-2xl bg-[#06C755] text-white font-semibold shadow-lg shadow-[#06C755]/20 active:scale-[0.98] transition-transform disabled:opacity-60"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 5.82 2 10.5c0 2.66 1.46 5.02 3.75 6.58-.16.57-.85 3.27-.88 3.46 0 0-.02.14.07.2.09.05.2.02.2.02.27-.04 3.15-2.07 3.64-2.42.7.1 1.42.16 2.17.16h.05C17.52 18.5 22 14.68 22 10.5 22 5.82 17.52 2 12 2z" fill="white"/>
          </svg>
          <span>{t('loginWithLine')}</span>
        </>
      )}
    </button>
    <p className="text-center text-[11px] text-muted-foreground leading-relaxed mt-3 px-2">
      การเข้าสู่ระบบถือว่าคุณยอมรับเงื่อนไขการใช้งาน และอนุญาตให้เราใช้ที่อยู่อีเมลเพื่อการสื่อสารเกี่ยวกับบริการ
    </p>
    </>
  );
}