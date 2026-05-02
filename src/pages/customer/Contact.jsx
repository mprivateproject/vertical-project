import React from 'react';
import { useLang } from '@/lib/LanguageContext';

export default function Contact() {
  const { lang } = useLang();

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-12 max-w-2xl mx-auto">
      <h1
        style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 'clamp(28px, 7vw, 42px)',
          fontWeight: 700,
          color: '#E5D3B3',
          letterSpacing: '0.04em',
          marginBottom: '32px',
        }}
      >
        {lang === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
      </h1>

      <p
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '15px',
          lineHeight: 1.85,
          color: 'rgba(255,255,255,0.65)',
          marginBottom: '36px',
        }}
      >
        {lang === 'th'
          ? 'สอบถามข้อมูลหรือสำรองที่นั่งผ่านช่องทางด้านล่าง'
          : 'For enquiries, membership referrals, or booking assistance, reach us through any of the channels below.'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* LINE */}
        <a
          href="https://lin.ee/qEHrpx0"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '18px 20px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(203,187,160,0.15)',
            textDecoration: 'none',
            transition: 'border-color 0.2s',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(0,195,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.477 2 2 6.084 2 11.111c0 4.52 3.663 8.306 8.615 9.012.335.072.791.22.906.506.104.26.068.668.033.931l-.146.88c-.045.26-.206 1.016.89.554 1.096-.462 5.913-3.482 8.07-5.963C21.636 15.318 22 13.27 22 11.111 22 6.084 17.523 2 12 2z" fill="rgba(0,195,0,0.85)" />
              <path d="M9.5 9H8.25a.25.25 0 0 0-.25.25v4.5c0 .138.112.25.25.25H9.5a.25.25 0 0 0 .25-.25v-4.5A.25.25 0 0 0 9.5 9zM15.75 9H14.5a.25.25 0 0 0-.25.25v2.673L12.427 9.11A.25.25 0 0 0 12.22 9H11a.25.25 0 0 0-.25.25v4.5c0 .138.112.25.25.25h1.25a.25.25 0 0 0 .25-.25v-2.672l1.827 2.816a.25.25 0 0 0 .207.106h1.216a.25.25 0 0 0 .25-.25v-4.5A.25.25 0 0 0 15.75 9z" fill="white" />
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em' }}>LINE Official</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.1em', marginTop: '2px' }}>@mprivateproject</p>
          </div>
        </a>

        {/* Location */}
        <a
          href="https://maps.app.goo.gl/T6STh82nTi6ku78c6"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '18px 20px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(203,187,160,0.15)',
            textDecoration: 'none',
            transition: 'border-color 0.2s',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(203,187,160,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(203,187,160,0.75)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em' }}>Location</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.1em', marginTop: '2px' }}>Nonthaburi, Thailand</p>
          </div>
        </a>

      </div>

      <p
        style={{
          marginTop: '40px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.15em',
          textTransform: 'lowercase',
          textAlign: 'center',
        }}
      >
        {lang === 'th' ? '' : ''}
      </p>
    </div>
  );
}