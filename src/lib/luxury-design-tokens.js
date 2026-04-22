/**
 * Luxury Spa Booking App - Design Tokens
 * Premium, minimal, calm aesthetic with glassmorphism
 */

export const luxuryTokens = {
  colors: {
    bg: {
      base: '#0B0F14',
      gradient: 'linear-gradient(180deg, #0B0F14 0%, #0F1720 100%)',
    },
    glass: {
      surface: 'rgba(255,255,255,0.05)',
      border: 'rgba(255,255,255,0.08)',
      surfaceHover: 'rgba(255,255,255,0.08)',
    },
    text: {
      primary: '#E5E7EB',
      secondary: 'rgba(229,231,235,0.7)',
      tertiary: 'rgba(229,231,235,0.5)',
    },
    accent: {
      gold: '#C6A87D',
      goldSoft: '#B8966B',
    },
  },
  radius: {
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    pill: '999px',
  },
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  shadow: {
    soft: '0 8px 30px rgba(0,0,0,0.35)',
    glow: '0 0 20px rgba(198,168,125,0.25)',
    lg: '0 12px 40px rgba(0,0,0,0.4)',
  },
  blur: {
    glass: '24px',
    glassNav: '20px',
  },
  transition: {
    default: 'all 180ms ease-out',
    fast: 'all 150ms ease-out',
    slow: 'all 250ms ease-out',
  },
  layout: {
    maxWidth: '420px',
    sectionSpacing: '32px',
    componentSpacing: '16px',
  },
};

export default luxuryTokens;