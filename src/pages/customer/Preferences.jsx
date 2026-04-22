import React, { useState, useEffect } from 'react';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { useTheme } from '@/lib/ThemeContext';
import { liffSyncClient } from '@/lib/liffSyncClient';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const E = [0.22, 1, 0.36, 1];

const OPTIONS = [
  {
    id: 'parking',
    th: 'ที่จอดรถ',
    en: 'Parking',
    desc_th: 'ต้องการใช้ที่จอดรถ',
    desc_en: 'I need parking space',
    icon: '🅿️',
  },
  {
    id: 'heated_bed',
    th: 'เตียงอุ่น',
    en: 'Heated Bed',
    desc_th: 'ต้องการเปิดเตียงระบบความร้อน',
    desc_en: 'Prefer a heated treatment bed',
    icon: '🛏️',
  },
  {
    id: 'unscented_oil',
    th: 'น้ำมันไม่มีกลิ่น',
    en: 'Unscented Oil',
    desc_th: 'ขอใช้น้ำมันนวดที่ไม่มีกลิ่น',
    desc_en: 'Please use unscented massage oil',
    icon: '🫧',
  },
  {
    id: 'no_talk',
    th: 'ไม่ต้องการสนทนาระหว่างนวด',
    en: 'No Conversation',
    desc_th: 'ต้องการความเงียบสงบระหว่างการนวด',
    desc_en: 'Prefer silence during the session',
    icon: '🤫',
  },
  {
    id: 'extra_pillow',
    th: 'ขอหมอนเพิ่ม',
    en: 'Extra Pillow',
    desc_th: 'ต้องการหมอนเพิ่มเพื่อความสบาย',
    desc_en: 'Would like an extra pillow for comfort',
    icon: '🪶',
  },
];

export default function Preferences() {
  const { lang } = useLang();
  const { customer } = useLine();
  const { isDark } = useTheme();
  const [selected, setSelected] = useState([]);
  const [freeText, setFreeText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (customer?.tags && Array.isArray(customer.tags)) {
      setSelected(customer.tags);
    }
    if (customer?.notes) {
      setFreeText(customer.notes);
    }
  }, [customer]);

  const toggle = (id) => {
    setSaved(false);
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setSaving(true);
    await liffSyncClient.call({
      url: '/functions/liffSync',
      method: 'POST',
      data: { action: 'updateCustomerPreferences', tags: selected, notes: freeText },
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="min-h-screen pb-36" style={{ background: isDark ? '#0E0F11' : '#F6F4F0' }}>
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: isDark
          ? 'radial-gradient(ellipse at 50% -10%, rgba(198,200,204,0.03) 0%, transparent 60%)'
          : 'radial-gradient(ellipse at 50% -10%, rgba(180,150,100,0.06) 0%, transparent 60%)' }} />

      <div className="relative z-10 px-5 pt-14 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: E }}>
          <Link to="/profile" className="inline-flex items-center gap-1.5 mb-5"
            style={{ color: isDark ? 'rgba(161,165,173,0.45)' : 'rgba(100,90,70,0.55)', fontFamily: 'Montserrat, sans-serif', fontSize: '13px', letterSpacing: '0.2em' }}>
            <ChevronLeft className="w-3.5 h-3.5" />
            {lang === 'th' ? 'กลับ' : 'BACK'}
          </Link>
          <p className="text-[12px] font-semibold tracking-[0.35em] uppercase mb-1"
            style={{ color: isDark ? 'rgba(161,165,173,0.4)' : 'rgba(140,120,90,0.55)', fontFamily: 'Montserrat, sans-serif' }}>
            — PERSONALIZE —
          </p>
          <h1 className="text-[8px] font-light tracking-wide"
            style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(30,25,15,0.88)', fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '0.02em' }}>
            {lang === 'th' ? 'ความต้องการพิเศษ' : 'Preferences'}
          </h1>
          <p className="text-[15px] mt-1.5" style={{ color: isDark ? 'rgba(161,165,173,0.4)' : 'rgba(100,90,70,0.5)', letterSpacing: '0.02em' }}>
            {lang === 'th'
              ? 'เลือกสิ่งที่ต้องการเพื่อประสบการณ์ที่ดีที่สุด'
              : 'Select to tailor your perfect experience'}
          </p>
        </motion.div>

        {/* Options List */}
        <div className="space-y-2">
          {OPTIONS.map((opt, i) => {
            const isSelected = selected.includes(opt.id);
            return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.07, duration: 0.4, ease: E }}
                whileTap={{ scale: 0.985 }}
                onClick={() => toggle(opt.id)}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all"
                style={{
                  background: isSelected
                    ? (isDark ? 'rgba(255,255,255,0.055)' : 'rgba(180,150,100,0.1)')
                    : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.6)'),
                  border: isSelected
                    ? (isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(180,150,100,0.35)')
                    : (isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(200,185,160,0.4)'),
                  boxShadow: isSelected ? (isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(180,150,100,0.12)') : 'none',
                }}
              >
                {/* Icon */}
                <span className="text-[24px] w-10 text-center flex-shrink-0">{opt.icon}</span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[18px] font-light leading-snug"
                    style={{
                      color: isSelected
                        ? (isDark ? 'rgba(255,255,255,0.92)' : 'rgba(30,25,15,0.88)')
                        : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(80,65,40,0.65)'),
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      letterSpacing: '0.01em',
                      transition: 'color 0.2s',
                    }}
                  >
                    {lang === 'th' ? opt.th : opt.en}
                  </p>
                  <p
                    className="text-[14px] mt-0.5"
                    style={{
                      color: isSelected
                        ? (isDark ? 'rgba(161,165,173,0.55)' : 'rgba(120,105,80,0.6)')
                        : (isDark ? 'rgba(161,165,173,0.3)' : 'rgba(140,125,100,0.45)'),
                      transition: 'color 0.2s',
                    }}
                  >
                    {lang === 'th' ? opt.desc_th : opt.desc_en}
                  </p>
                </div>

                {/* Checkmark */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: isSelected
                      ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(160,130,80,0.18)')
                      : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(180,160,120,0.1)'),
                    border: isSelected
                      ? (isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(160,130,80,0.35)')
                      : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(180,160,120,0.2)'),
                  }}
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Check className="w-3 h-3" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(120,90,40,0.9)' }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(180,160,120,0.2)' }} />

        {/* Free Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: E }}
        >
          <p className="text-[12px] font-semibold tracking-[0.3em] uppercase mb-3"
            style={{ color: isDark ? 'rgba(161,165,173,0.4)' : 'rgba(140,120,90,0.55)', fontFamily: 'Montserrat, sans-serif' }}>
            {lang === 'th' ? 'หมายเหตุพิเศษ' : 'Special Notes'}
          </p>
          <textarea
            value={freeText}
            onChange={e => { setFreeText(e.target.value); setSaved(false); }}
            placeholder={lang === 'th'
              ? 'แจ้งข้อมูลเพิ่มเติม เช่น อาการปวด บาดแผล หรือความต้องการอื่นๆ...'
              : 'Any additional info, e.g. pain areas, injuries, or other requests...'}
            rows={4}
            className="w-full px-4 py-3.5 rounded-2xl text-[16px] resize-none outline-none transition-all"
            style={{
              background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.7)',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,185,160,0.4)',
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(30,25,15,0.8)',
              fontFamily: 'Georgia, serif',
              lineHeight: 1.7,
            }}
          />
        </motion.div>

        {/* Save Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-2xl text-[15px] font-semibold tracking-[0.22em] uppercase transition-all disabled:opacity-40"
          style={{
            background: saved
              ? (isDark ? 'rgba(60,160,60,0.07)' : 'rgba(60,160,60,0.08)')
              : (isDark ? 'linear-gradient(150deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)' : 'linear-gradient(150deg, rgba(160,130,80,0.15) 0%, rgba(180,150,100,0.08) 100%)'),
            border: saved
              ? (isDark ? '1px solid rgba(160,220,160,0.18)' : '1px solid rgba(100,180,100,0.3)')
              : (isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(180,150,100,0.35)'),
            color: saved
              ? (isDark ? 'rgba(160,220,160,0.85)' : 'rgba(60,140,60,0.85)')
              : (isDark ? 'rgba(255,255,255,0.8)' : 'rgba(80,60,30,0.8)'),
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          {saving ? '· · ·' : saved
            ? (lang === 'th' ? '✓  บันทึกแล้ว' : '✓  Saved')
            : (lang === 'th' ? 'บันทึก' : 'Save Preferences')}
        </motion.button>

      </div>
    </div>
  );
}