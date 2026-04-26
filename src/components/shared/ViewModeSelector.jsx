import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Monitor, Tablet } from 'lucide-react';
import { useViewMode } from '@/lib/ViewModeContext';

const MODES = [
  { key: 'mobile', label: 'Mobile', icon: Smartphone },
  { key: 'tablet', label: 'Tablet', icon: Tablet },
  { key: 'desktop', label: 'Desktop', icon: Monitor },
];

export default function ViewModeSelector({ onClose }) {
  const { viewMode, setMode } = useViewMode();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(14,12,10,0.95)',
          border: '1px solid rgba(203,187,160,0.15)',
          borderRadius: '28px',
          padding: '40px 32px 36px',
          width: '100%',
          maxWidth: '360px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <p style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: '22px',
            fontWeight: 500,
            fontStyle: 'italic',
            color: '#E5D3B3',
            letterSpacing: '0.04em',
          }}>
            Choose Your View
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            fontWeight: 400,
            letterSpacing: '0.25em',
            color: 'rgba(203,187,160,0.4)',
            textTransform: 'lowercase',
            marginTop: '6px',
          }}>
            select preferred experience
          </p>
        </div>

        {/* Mode options */}
        <div className="flex flex-col gap-3">
          {MODES.map(({ key, label, icon: Icon }) => {
            const isSelected = viewMode === key;
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setMode(key); onClose && onClose(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  border: isSelected ? '1px solid rgba(203,187,160,0.4)' : '1px solid rgba(255,255,255,0.07)',
                  background: isSelected
                    ? 'rgba(203,187,160,0.08)'
                    : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(203,187,160,0.15)' : 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon style={{ width: '18px', height: '18px', color: isSelected ? '#E5D3B3' : 'rgba(255,255,255,0.35)' }} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: isSelected ? '#E5D3B3' : 'rgba(255,255,255,0.65)',
                    letterSpacing: '0.04em',
                  }}>
                    {label}
                  </p>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.28)',
                    letterSpacing: '0.1em',
                    marginTop: '2px',
                  }}>
                    {key === 'mobile' && 'Optimized for phone screens'}
                    {key === 'tablet' && 'Centered layout, wider content'}
                    {key === 'desktop' && 'Full-width with sidebar nav'}
                  </p>
                </div>
                {isSelected && (
                  <div style={{
                    marginLeft: 'auto',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#E5D3B3',
                    flexShrink: 0,
                  }} />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            marginTop: '24px',
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'transparent',
            color: 'rgba(255,255,255,0.3)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            letterSpacing: '0.2em',
            textTransform: 'lowercase',
            cursor: 'pointer',
          }}
        >
          dismiss
        </button>
      </motion.div>
    </motion.div>
  );
}