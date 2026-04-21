import React, { useState, useEffect } from 'react';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { liffSyncClient } from '@/lib/liffSyncClient';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const E = [0.22, 1, 0.36, 1];

const OPTIONS = [
  { id: 'parking',         th: '🅿️  มีที่จอดรถ',              en: '🅿️  Parking Available' },
  { id: 'no_scent_oil',    th: '🌿  น้ำมันไม่มีกลิ่น',         en: '🌿  Unscented Oil' },
  { id: 'light_pressure',  th: '🪶  แรงกดเบา',                en: '🪶  Light Pressure' },
  { id: 'medium_pressure', th: '💆  แรงกดปานกลาง',            en: '💆  Medium Pressure' },
  { id: 'firm_pressure',   th: '💪  แรงกดแรง',               en: '💪  Firm Pressure' },
  { id: 'focus_back',      th: '🔸  เน้นบริเวณหลัง',          en: '🔸  Focus on Back' },
  { id: 'focus_neck',      th: '🔸  เน้นบริเวณคอ/บ่า',        en: '🔸  Focus on Neck & Shoulders' },
  { id: 'focus_legs',      th: '🔸  เน้นบริเวณขา/เท้า',       en: '🔸  Focus on Legs & Feet' },
  { id: 'quiet',           th: '🤫  ต้องการความเงียบสงบ',      en: '🤫  Prefer Silence' },
  { id: 'music_soft',      th: '🎵  เปิดเพลงเบาๆ',            en: '🎵  Soft Background Music' },
  { id: 'warm_towel',      th: '🔥  ผ้าเย็น/ผ้าอุ่นก่อนนวด',  en: '🔥  Warm Towel Before Session' },
  { id: 'no_talk',         th: '🙏  ไม่ต้องการสนทนาระหว่างนวด', en: '🙏  No Conversation During Session' },
  { id: 'allergy_nut',     th: '⚠️  แพ้ถั่ว',                 en: '⚠️  Nut Allergy' },
  { id: 'allergy_latex',   th: '⚠️  แพ้ยาง (Latex)',          en: '⚠️  Latex Allergy' },
  { id: 'extra_pillow',    th: '🛏️  ขอหมอนเพิ่ม',             en: '🛏️  Extra Pillow' },
];

export default function Preferences() {
  const { lang } = useLang();
  const { customer } = useLine();
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (customer?.tags && Array.isArray(customer.tags)) {
      setSelected(customer.tags);
    }
  }, [customer]);

  const toggle = (id) => {
    setSaved(false);
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await liffSyncClient.call({
      url: '/functions/liffSync',
      method: 'POST',
      data: { action: 'updateCustomerTags', tags: selected },
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="min-h-screen pb-36" style={{ background: '#0E0F11' }}>
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(198,200,204,0.03) 0%, transparent 60%)' }} />

      <div className="relative z-10 px-5 pt-14 space-y-7">

        {/* Back + Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: E }}>
          <Link to="/profile" className="inline-flex items-center gap-1.5 mb-5"
            style={{ color: 'rgba(161,165,173,0.45)', fontFamily: 'Montserrat, sans-serif', fontSize: '10px', letterSpacing: '0.2em' }}>
            <ChevronLeft className="w-3.5 h-3.5" />
            {lang === 'th' ? 'กลับ' : 'BACK'}
          </Link>
          <p className="text-[9px] font-semibold tracking-[0.35em] uppercase mb-1"
            style={{ color: 'rgba(161,165,173,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
            — PERSONALIZE —
          </p>
          <h1 className="text-2xl font-light tracking-wide"
            style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Georgia, "Times New Roman", serif' }}>
            {lang === 'th' ? 'ความต้องการพิเศษ' : 'Preferences'}
          </h1>
          <p className="text-[12px] mt-1.5" style={{ color: 'rgba(161,165,173,0.45)' }}>
            {lang === 'th' ? 'เลือกได้หลายรายการ นักบำบัดจะเตรียมพร้อมให้คุณ' : 'Select all that apply — our therapists will prepare accordingly'}
          </p>
        </motion.div>

        {/* Options */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-1 gap-2"
        >
          {OPTIONS.map((opt, i) => {
            const isOn = selected.includes(opt.id);
            return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.04, duration: 0.35, ease: E }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggle(opt.id)}
                className="flex items-center justify-between px-4 py-3.5 rounded-2xl text-left transition-all"
                style={{
                  background: isOn ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                  border: isOn ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span className="text-[14px] font-light"
                  style={{ color: isOn ? 'rgba(255,255,255,0.9)' : 'rgba(161,165,173,0.6)', fontFamily: 'Georgia, serif' }}>
                  {lang === 'th' ? opt.th : opt.en}
                </span>
                <AnimatePresence>
                  {isOn && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                      <Check className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.8)' }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Save Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-2xl text-[12px] font-semibold tracking-[0.2em] uppercase transition-all disabled:opacity-40"
          style={{
            background: saved
              ? 'rgba(60,160,60,0.08)'
              : 'linear-gradient(150deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            border: saved ? '1px solid rgba(160,220,160,0.2)' : '1px solid rgba(255,255,255,0.14)',
            color: saved ? 'rgba(160,220,160,0.9)' : 'rgba(255,255,255,0.85)',
          }}
        >
          {saving ? '· · ·' : saved
            ? (lang === 'th' ? '✓ บันทึกแล้ว' : '✓ Saved')
            : (lang === 'th' ? 'บันทึก' : 'Save Preferences')}
        </motion.button>

      </div>
    </div>
  );
}