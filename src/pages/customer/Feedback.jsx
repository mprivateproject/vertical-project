import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { useTheme } from '@/lib/ThemeContext';
import { base44 } from '@/api/base44Client';
import { Check } from 'lucide-react';

const E = [0.22, 1, 0.36, 1];

const CATEGORIES = [
  { id: 'general',  th: 'ทั่วไป',      en: 'General' },
  { id: 'service',  th: 'บริการ',      en: 'Service' },
  { id: 'therapist',th: 'นักบำบัด',   en: 'Therapist' },
  { id: 'facility', th: 'สถานที่',     en: 'Facility' },
  { id: 'booking',  th: 'การจอง',      en: 'Booking' },
];

export default function FeedbackPage() {
  const { lang } = useLang();
  const { customer, lineProfile } = useLine();
  const { isDark } = useTheme();

  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const bg = isDark ? '#0E0F11' : '#F5F2EE';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)';
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)';
  const textColor = isDark ? 'rgba(255,255,255,0.88)' : 'rgba(40,35,30,0.9)';
  const mutedColor = isDark ? 'rgba(161,165,173,0.45)' : 'rgba(120,110,100,0.55)';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)';
  const inputBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)';

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    await base44.entities.Feedback.create({
      message: message.trim(),
      rating: rating || undefined,
      category,
      display_name: lineProfile?.displayName || customer?.display_name || '',
      lang,
    });
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: bg }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: E }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 220, damping: 18 }}
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
            style={{
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <Check className="w-7 h-7" style={{ color: isDark ? 'rgba(160,220,160,0.9)' : 'rgba(40,130,40,0.8)' }} />
          </motion.div>
          <div>
            <p
              className="text-[24px] font-light"
              style={{ color: textColor, fontFamily: 'Georgia, serif', letterSpacing: '0.02em' }}
            >
              {lang === 'th' ? 'ขอบคุณมากๆ' : 'Thank You'}
            </p>
            <p className="text-[14px] mt-2" style={{ color: mutedColor }}>
              {lang === 'th' ? 'เราได้รับข้อเสนอแนะของคุณแล้ว' : 'Your feedback has been received'}
            </p>
          </div>
          <button
            onClick={() => { setDone(false); setMessage(''); setRating(0); setCategory('general'); }}
            className="text-[13px] tracking-[0.2em] uppercase"
            style={{ color: mutedColor }}
          >
            {lang === 'th' ? 'ส่งอีกครั้ง' : 'Send Another'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-36" style={{ background: bg }}>
      <div className="relative z-10 px-5 pt-14 space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: E }}
        >
          <p className="text-[9px] font-semibold tracking-[0.35em] uppercase mb-1"
            style={{ color: mutedColor, fontFamily: 'var(--font-body)' }}>
            — {lang === 'th' ? 'ข้อเสนอแนะ' : 'FEEDBACK'} —
          </p>
          <h1
            className="text-2xl font-light tracking-wide"
            style={{ color: textColor, fontFamily: 'var(--font-heading)', letterSpacing: '0.03em' }}
          >
            {lang === 'th' ? 'แบ่งปันความรู้สึก' : 'Share Your Thoughts'}
          </h1>
        </motion.div>

        {/* Rating */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5, ease: E }}
          className="rounded-2xl p-5 space-y-3"
          style={{ background: cardBg, border: cardBorder }}
        >
          <p className="text-[11px] tracking-[0.25em] uppercase font-medium" style={{ color: mutedColor }}>
            {lang === 'th' ? 'ความพึงพอใจ' : 'Rating'}
          </p>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star === rating ? 0 : star)}
                className="text-3xl transition-all active:scale-90"
                style={{ opacity: star <= (hoveredRating || rating) ? 1 : 0.2 }}
              >
                ✦
              </button>
            ))}
          </div>
        </motion.div>

        {/* Category */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5, ease: E }}
          className="space-y-3"
        >
          <p className="text-[11px] tracking-[0.25em] uppercase font-medium" style={{ color: mutedColor }}>
            {lang === 'th' ? 'หมวดหมู่' : 'Category'}
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className="px-4 py-2 rounded-full text-[12px] tracking-[0.12em] transition-all active:scale-95"
                  style={{
                    background: isSelected
                      ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')
                      : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                    border: isSelected
                      ? (isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.15)')
                      : (isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)'),
                    color: isSelected ? textColor : mutedColor,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {lang === 'th' ? cat.th : cat.en}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.5, ease: E }}
          className="space-y-3"
        >
          <p className="text-[11px] tracking-[0.25em] uppercase font-medium" style={{ color: mutedColor }}>
            {lang === 'th' ? 'ข้อเสนอแนะ' : 'Message'}
          </p>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            placeholder={
              lang === 'th'
                ? 'แบ่งปันประสบการณ์หรือข้อเสนอแนะของคุณ...'
                : 'Share your experience or suggestions...'
            }
            className="w-full px-4 py-3 rounded-2xl text-[16px] resize-none outline-none transition-all"
            style={{
              background: inputBg,
              border: inputBorder,
              color: textColor,
              fontFamily: 'Georgia, serif',
              lineHeight: 1.6,
            }}
          />
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: E }}
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={!message.trim() || submitting}
            className="w-full py-4 rounded-2xl text-[14px] font-semibold tracking-[0.22em] uppercase transition-all disabled:opacity-30"
            style={{
              background: isDark
                ? 'linear-gradient(150deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)'
                : 'linear-gradient(150deg, rgba(0,0,0,0.07) 0%, rgba(0,0,0,0.04) 100%)',
              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)',
              color: textColor,
              fontFamily: 'var(--font-body)',
            }}
          >
            {submitting ? '· · ·' : (lang === 'th' ? 'ส่งข้อเสนอแนะ' : 'Submit Feedback')}
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}