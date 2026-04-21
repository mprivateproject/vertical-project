import React, { useState, useEffect } from 'react';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { liffSyncClient } from '@/lib/liffSyncClient';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const E = [0.22, 1, 0.36, 1];

const SECTIONS = [
  {
    id: 'pressure',
    label_th: '💆 แรงกด',
    label_en: '💆 Pressure',
    single: true, // radio style (only one)
    options: [
      { id: 'pressure_light',  th: '🪶  เบา',         en: '🪶  Light' },
      { id: 'pressure_medium', th: '💆  ปานกลาง',     en: '💆  Medium' },
      { id: 'pressure_firm',   th: '💪  แรง',         en: '💪  Firm' },
      { id: 'pressure_deep',   th: '🔥  Deep Tissue', en: '🔥  Deep Tissue' },
    ],
  },
  {
    id: 'focus',
    label_th: '🔸 บริเวณที่ต้องการเน้น',
    label_en: '🔸 Focus Areas',
    single: false,
    options: [
      { id: 'focus_back',      th: 'หลัง',           en: 'Back' },
      { id: 'focus_neck',      th: 'คอ / บ่า',       en: 'Neck & Shoulders' },
      { id: 'focus_legs',      th: 'ขา / เท้า',      en: 'Legs & Feet' },
      { id: 'focus_arms',      th: 'แขน / มือ',      en: 'Arms & Hands' },
      { id: 'focus_head',      th: 'ศีรษะ',          en: 'Head' },
      { id: 'focus_face',      th: 'ใบหน้า',         en: 'Face' },
    ],
  },
  {
    id: 'bed',
    label_th: '🛏️ ประเภทเตียง',
    label_en: '🛏️ Bed Type',
    single: true,
    options: [
      { id: 'bed_standard',   th: 'เตียงมาตรฐาน',       en: 'Standard Bed' },
      { id: 'bed_floor',      th: 'นวดบนพื้น (ฟูก)',    en: 'Floor Mat' },
      { id: 'bed_heated',     th: 'เตียงอุ่น (Heated)', en: 'Heated Bed' },
    ],
  },
  {
    id: 'room_temp',
    label_th: '🌡️ อุณหภูมิห้อง',
    label_en: '🌡️ Room Temperature',
    single: true,
    options: [
      { id: 'temp_cool',   th: 'เย็น (ประมาณ 20–22°C)', en: 'Cool (20–22°C)' },
      { id: 'temp_normal', th: 'ปกติ (ประมาณ 23–25°C)', en: 'Normal (23–25°C)' },
      { id: 'temp_warm',   th: 'อบอุ่น (ประมาณ 26°C+)', en: 'Warm (26°C+)' },
    ],
  },
  {
    id: 'aroma',
    label_th: '🌸 กลิ่นอโรมา',
    label_en: '🌸 Aroma Preference',
    single: true,
    options: [
      { id: 'aroma_none',      th: 'ไม่ใช้น้ำมันกลิ่น',  en: 'No Scent' },
      { id: 'aroma_lavender',  th: 'ลาเวนเดอร์',         en: 'Lavender' },
      { id: 'aroma_eucalyptus',th: 'ยูคาลิปตัส',         en: 'Eucalyptus' },
      { id: 'aroma_citrus',    th: 'ส้ม / ซิตรัส',       en: 'Citrus' },
      { id: 'aroma_rose',      th: 'กุหลาบ',             en: 'Rose' },
      { id: 'aroma_jasmine',   th: 'มะลิ',               en: 'Jasmine' },
    ],
  },
  {
    id: 'ambience',
    label_th: '🎵 บรรยากาศ',
    label_en: '🎵 Ambience',
    single: false,
    options: [
      { id: 'quiet',       th: 'เงียบสงบ ไม่เปิดเพลง',    en: 'Silence, no music' },
      { id: 'music_soft',  th: 'เปิดเพลงเบาๆ',            en: 'Soft background music' },
      { id: 'music_nature',th: 'เสียงธรรมชาติ',           en: 'Nature sounds' },
      { id: 'no_talk',     th: 'ไม่ต้องการสนทนาระหว่างนวด', en: 'No conversation during session' },
    ],
  },
  {
    id: 'extras',
    label_th: '✦ บริการเสริม',
    label_en: '✦ Extra Requests',
    single: false,
    options: [
      { id: 'warm_towel',   th: 'ผ้าอุ่นก่อนนวด',      en: 'Warm towel before session' },
      { id: 'extra_pillow', th: 'ขอหมอนเพิ่ม',          en: 'Extra pillow' },
      { id: 'parking',      th: 'มีที่จอดรถ',           en: 'Parking needed' },
      { id: 'wheelchair',   th: 'ต้องการทางลาด/เก้าอี้รถเข็น', en: 'Wheelchair accessible' },
    ],
  },
  {
    id: 'allergies',
    label_th: '⚠️ ข้อควรระวัง / การแพ้',
    label_en: '⚠️ Allergies / Cautions',
    single: false,
    options: [
      { id: 'allergy_nut',   th: 'แพ้ถั่ว',         en: 'Nut allergy' },
      { id: 'allergy_latex', th: 'แพ้ยาง (Latex)',   en: 'Latex allergy' },
      { id: 'allergy_scent', th: 'แพ้กลิ่นน้ำหอม',  en: 'Fragrance sensitivity' },
      { id: 'pregnant',      th: 'ตั้งครรภ์',        en: 'Pregnant' },
      { id: 'injury',        th: 'มีบาดแผล/ผ่าตัดเมื่อเร็วๆ นี้', en: 'Recent injury/surgery' },
    ],
  },
];

function OptionChip({ label, selected, onToggle }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onToggle}
      className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-left transition-all"
      style={{
        background: selected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
        border: selected ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <span
        className="text-[13px] font-light flex-1"
        style={{ color: selected ? 'rgba(255,255,255,0.92)' : 'rgba(161,165,173,0.6)', fontFamily: 'Georgia, serif' }}
      >
        {label}
      </span>
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <Check className="w-2.5 h-2.5" style={{ color: 'rgba(255,255,255,0.9)' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default function Preferences() {
  const { lang } = useLang();
  const { customer } = useLine();
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

  const toggle = (id, isSingle, sectionOptions) => {
    setSaved(false);
    if (isSingle) {
      const sectionIds = sectionOptions.map(o => o.id);
      setSelected(prev => {
        const withoutSection = prev.filter(x => !sectionIds.includes(x));
        return prev.includes(id) ? withoutSection : [...withoutSection, id];
      });
    } else {
      setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }
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
    <div className="min-h-screen pb-36" style={{ background: '#0E0F11' }}>
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(198,200,204,0.03) 0%, transparent 60%)' }} />

      <div className="relative z-10 px-5 pt-14 space-y-8">

        {/* Header */}
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
          <p className="text-[12px] mt-1.5" style={{ color: 'rgba(161,165,173,0.4)' }}>
            {lang === 'th'
              ? 'บอกเราเพื่อเตรียมประสบการณ์ที่ดีที่สุดสำหรับคุณ'
              : 'Help us prepare the perfect experience for you'}
          </p>
        </motion.div>

        {/* Sections */}
        {SECTIONS.map((section, si) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + si * 0.06, duration: 0.4, ease: E }}
          >
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase"
                style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Montserrat, sans-serif' }}>
                {lang === 'th' ? section.label_th : section.label_en}
              </p>
              {section.single && (
                <span className="text-[9px] tracking-[0.1em] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(161,165,173,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
                  {lang === 'th' ? 'เลือก 1' : 'pick one'}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {section.options.map(opt => (
                <OptionChip
                  key={opt.id}
                  label={lang === 'th' ? opt.th : opt.en}
                  selected={selected.includes(opt.id)}
                  onToggle={() => toggle(opt.id, section.single, section.options)}
                />
              ))}
            </div>
          </motion.div>
        ))}

        {/* Free Text */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4, ease: E }}
        >
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase mb-3"
            style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Montserrat, sans-serif' }}>
            {lang === 'th' ? '📝 หมายเหตุพิเศษ' : '📝 Special Notes'}
          </p>
          <textarea
            value={freeText}
            onChange={e => { setFreeText(e.target.value); setSaved(false); }}
            placeholder={lang === 'th'
              ? 'แจ้งข้อมูลเพิ่มเติม เช่น อาการปวด บาดแผล หรือความต้องการพิเศษอื่นๆ...'
              : 'Any additional info, e.g. pain areas, injuries, or other special requests...'}
            rows={4}
            className="w-full px-4 py-3.5 rounded-2xl text-[13px] resize-none outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.8)',
              fontFamily: 'Georgia, serif',
            }}
          />
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