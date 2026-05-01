import React from 'react';
import { useLang } from '@/lib/LanguageContext';

export default function About() {
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
        {lang === 'th' ? 'เกี่ยวกับเรา' : 'About M Private Project'}
      </h1>

      <div
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '15px',
          lineHeight: 1.85,
          color: 'rgba(255,255,255,0.72)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <p>
          M Private Project is an exclusive, invitation-only wellness sanctuary located in
          Nonthaburi, Thailand. We offer a refined selection of therapeutic massage and body
          treatments designed for those who value privacy, discretion, and exceptional care.
        </p>

        <p>
          Our signature service — the House Signature massage — is a 90-minute full-body
          experience crafted to restore balance, ease tension, and leave guests feeling
          genuinely renewed. Every session is tailored to the individual, guided by skilled
          therapists who bring both technical expertise and genuine warmth to their work.
        </p>

        <p>
          M Private Project exists for guests who seek something beyond the ordinary spa
          visit. We operate on a members-and-referrals basis, keeping our community intimate
          and our quality consistently high. Our environment is calm, uncluttered, and
          intentionally designed — a space where you can truly switch off.
        </p>

        <p>
          Built and operated by a small team passionate about hospitality and well-being,
          M Private Project combines modern booking technology with a deeply personal
          approach to service. We believe the best experiences happen when attention to
          detail meets genuine human connection.
        </p>

        <p>
          Whether you are an existing member or have been referred by a guest, we look
          forward to welcoming you and crafting a session that meets your needs.
        </p>

        <div
          style={{
            marginTop: '16px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(203,187,160,0.15)',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.1em',
            textTransform: 'lowercase',
          }}
        >
          Nonthaburi, Thailand &nbsp ;·&nbsp; LINE: @mprivateproject
        </div>
      </div>
    </div>
  );
}