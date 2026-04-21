import React, { useState, useEffect } from 'react';
import { useLang } from '@/lib/LanguageContext';
import { useLine } from '@/lib/LineContext';
import { liffSyncClient } from '@/lib/liffSyncClient';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const E = [0.22, 1, 0.36, 1];

const QUICK_OPTIONS = [
  { id: 'parking',     th: 'ที่จอดรถ',                    en: 'Parking Available' },
  { id: 'bed_heated',  th: 'เตียงอุ่น',                   en: 'Heated Bed' },
  { id: 'aroma_none',  th: 'น้ำมันไม่มีกลิ่น',            en: 'Unscented Oil' },
  { id: 'no_talk',     th: 'ไม่ต้องการสนทนาระหว่างนวด',   en: 'No Conversation' },
  { id: 'extra_pillow',th: 'ขอหมอนเพิ่ม',                 en: 'Extra Pillow' },
];

const SECTIONS = [
  {
    id: 'pressure',
    label_th: 'แรงกด',
    label_en: 'Pressure',
    single: true,
    options: [
      { id: 'pressure_light',   th: 'เบา',         en: 'Light' },
      { id: 'pressure_medium',  th: 'ปานกลาง',     en: 'Medium' },
      { id: 'pressure_firm',    th: 'แรง',         en: 'Firm' },
      { id: 'pressure_deep',    th: 'Deep Tissue',  en: 'Deep Tissue' },
    ],
  },
  {
    id: 'focus',
    label_th: 'บริเวณที่ต้องการเน้น',
    label_en: 'Focus Areas',
    single: false,
    options: [
      { id: 'focus_back',  th: 'หลัง',        en: 'Back' },
      { id: 'focus_neck',  th: 'คอ / บ่า',    en: 'Neck & Shoulders' },
      { id: 'focus_legs',  th: 'ขา / เท้า',   en: 'Legs & Feet' },
      { id: 'focus_arms',  th: 'แขน / มือ',   en: 'Arms & Hands' },
      { id: 'focus_head',  th: 'ศีรษะ',       en: 'Head' },
      { id: 'focus_face',  th: 'ใบหน้า',      en: 'Face' },
    ],
  },
  {
    id: 'aroma',
    label_th: 'กลิ่นอโรมา',
    label_en: 'Aroma',
    single: true,
    options: [
      { id: 'aroma_none',       th: 'ไม่ใช้กลิ่น',  en: 'No Scent' },
      { id: 'aroma_lavender',   th: 'ลาเวนเดอร์',   en: 'Lavender' },
      { id: 'aroma_eucalyptus', th: 'ยูคาลิปตัส',   en: 'Eucalyptus' },
      { id: 'aroma_citrus',     th: 'ซิตรัส',       en: 'Citrus' },
      { id: 'aroma_rose',       th: 'กุหลาบ',       en: 'Rose' },
      { id: 'aroma_jasmine',    th: 'มะลิ',         en: 'Jasmine' },
    ],
  },
  {
    id: 'room_temp',
    label_th: 'อุณหภูมิห้อง',
    label_en: 'Room Temperature',
    single: true,
    options: [
      { id: 'temp_cool',   th: 'เย็น  20–22°C',  en: 'Cool  20–22°C' },
      { id: 'temp_normal', th: 'ปกติ  23–25°C',  en: 'Normal  23–25°C' },
      { id: 'temp_warm',   th: 'อบอุ่น  26°C+',  en: 'Warm  26°C+' },
    ],
  },
  {
    id: 'bed',
    label_th: 'ประเภทเตียง',
    label_en: 'Bed Type',
    single: true,
    options: [
      { id: 'bed_standard', th: 'เตียงมาตรฐาน',    en: 'Standard Bed' },
      { id: 'bed_floor',    th: 'นวดบนพื้น (ฟูก)', en: 'Floor Mat' },
      { id: 'bed_heated',   th: 'เตียงอุ่น',       en: 'Heated Bed' },
    ],
  },
  {
    id: 'ambience',
    label_th: 'บรรยากาศ',
    label_en: 'Ambience',
    single: false,
    options: [
      { id: 'quiet',        th: 'เงียบสงบ',          en: 'Silence' },
      { id: 'music_soft',   th: 'เพลงเบาๆ',          en: 'Soft Music' },
      { id: 'music_nature', th: 'เสียงธรรมชาติ',     en: 'Nature Sounds' },
      { id: 'no_talk',      th: 'ไม่สนทนาระหว่างนวด', en: 'No Conversation' },
    ],
  },
  {
    id: 'allergies',
    label_th: 'ข้อควรระวัง',
    label_en: 'Allergies & Cautions',
    single: false,
    options: [
      { id: 'allergy_nut',   th: 'แพ้ถั่ว',           en: 'Nut Allergy' },
      { id: 'allergy_latex', th: 'แพ้ยาง (Latex)',     en: 'Latex Allergy' },
      { id: 'allergy_scent', th: 'แพ้กลิ่นน้ำหอม',    en: 'Fragrance Sensitivity' },
      { id: 'pregnant',      th: 'ตั้งครรภ์',          en: 'Pregnant' },
      { id: 'injury',        th: 'มีบาดแผล/ผ่าตัด',    en: 'Recent Injury/Surgery' },
    ],
  },
];

function ListRow({ label, selected, onToggle, index }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: E }}
      whileTap={{ scale: 0.99 }}
      onClick={onToggle}
      className="w-full flex items-center justify-between py-4 transition-all"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <span
        className="text-[15px] font-light tracking-wide"
        style={{
          color: selected ? 'rgba(255,255,255,0.92)' : 'rgba(161,165,173,0.55)',
          fontFamily: 'Georgia, "Times New Roman", serif',
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </span>
      <AnimatePresence mode="popLayout">
        {selected ? (
          <motion.div
            key="on"
            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <Check className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.9)' }} />
          </motion.div>
        ) : (
          <motion.div
            key="off"
            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-5 h-5 rounded-full flex-shrink-0"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function SectionBlock({ section, selected, onToggle, lang }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <p className="text-[9px] font-semibold tracking-[0.3em] uppercase"
          style={{ color: 'rgba(161,165,173,0.35)', fontFamily: 'Montserrat, sans-serif' }}>
          {lang === 'th' ? section.label_th : section.label_en}
        </p>
        {section.single && (
          <span className="text-[8px] tracking-[0.1em] px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(161,165,173,0.3)', fontFamily: 'Montserrat, sans-serif' }}>
            {lang === 'th' ? 'เลือก 1' : 'pick one'}
          </span>
        )}
      </div>
      <div>
        {section.options.map((opt, i) => (
          <ListRow
            key={opt.id}
            index={i}
            label={lang === 'th' ? opt.th : opt.en}
            selected={selected.includes(opt.id)}
            onToggle={() => onToggle(opt.id, section.single, section.options)}
          />
        ))}
      </div>
    </div>
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
    if (customer?.tags && Array.isArray(customer.tags)) setSelected(customer.tags);
    if (customer?.notes) setFreeText(customer.notes);
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

  const toggleQuick = (id) => {
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
    <div className="min-h-screen pb-36" style={{ background: '#0E0F11' }}>
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(198,200,204,0.03) 0%, transparent 60%)' }} />

      <div className="relative z-10 px-5 pt-14 space-y-9">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: E }}>
          <Link to="/profile" className="inline-flex items-center gap-1.5 mb-5"
            style={{ color: 'rgba(161,165,173,0.4)', fontFamily: 'Montserrat, sans-serif', fontSize: '10px', letterSpacing: '0.2em' }}>
            <ChevronLeft className="w-3.5 h-3.5" />
            {lang === 'th' ? 'กลับ' : 'BACK'}
          </Link>
          <p className="text-[9px] font-semibold tracking-[0.35em] uppercase mb-2"
            style={{ color: 'rgba(161,165,173,0.35)', fontFamily: 'Montserrat, sans-serif' }}>
            — PERSONALIZE —
          </p>
          <h1 className="text-[22px] font-light leading-snug"
            style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '0.01em' }}>
            {lang === 'th' ? 'ปรับแต่งประสบการณ์\nของคุณ' : 'Personalize\nYour Session'}
          </h1>
          <p className="text-[12px] mt-2" style={{ color: 'rgba(161,165,173,0.4)', letterSpacing: '0.01em' }}>
            {lang === 'th' ? 'Personalize your session for maximum comfort' : 'Personalize your session for maximum comfort'}
          </p>
        </motion.div>

        {/* Quick Picks */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.4, ease: E }}
        >
          <p className="text-[9px] font-semibold tracking-[0.3em] uppercase mb-1"
            style={{ color: 'rgba(161,165,173,0.35)', fontFamily: 'Montserrat, sans-serif' }}>
            {lang === 'th' ? 'ความต้องการหลัก' : 'Quick Picks'}
          </p>
          <div>
            {QUICK_OPTIONS.map((opt, i) => (
              <ListRow
                key={opt.id}
                index={i}
                label={lang === 'th' ? opt.th : opt.en}
                selected={selected.includes(opt.id)}
                onToggle={() => toggleQuick(opt.id)}
              />
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />

        {/* Detailed Sections */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.5 }}
          className="space-y-8"
        >
          <p className="text-[9px] font-semibold tracking-[0.3em] uppercase -mb-2"
            style={{ color: 'rgba(161,165,173,0.35)', fontFamily: 'Montserrat, sans-serif' }}>
            {lang === 'th' ? 'รายละเอียดเพิ่มเติม' : 'More Details'}
          </p>
          {SECTIONS.map(section => (
            <SectionBlock
              key={section.id}
              section={section}
              selected={selected}
              onToggle={toggle}
              lang={lang}
            />
          ))}
        </motion.div>

        {/* Free Text */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4, ease: E }}
        >
          <p className="text-[9px] font-semibold tracking-[0.3em] uppercase mb-3"
            style={{ color: 'rgba(161,165,173,0.35)', fontFamily: 'Montserrat, sans-serif' }}>
            {lang === 'th' ? 'หมายเหตุพิเศษ' : 'Special Notes'}
          </p>
          <textarea
            value={freeText}
            onChange={e => { setFreeText(e.target.value); setSaved(false); }}
            placeholder={lang === 'th'
              ? 'แจ้งข้อมูลเพิ่มเติม เช่น อาการปวด บาดแผล หรือความต้องการอื่นๆ...'
              : 'Any additional info, e.g. pain areas, injuries, or special requests...'}
            rows={4}
            className="w-full px-4 py-4 rounded-2xl text-[14px] resize-none outline-none"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.75)',
              fontFamily: 'Georgia, serif',
              lineHeight: '1.7',
            }}
          />
        </motion.div>

        {/* Save */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-2xl text-[11px] font-semibold tracking-[0.25em] uppercase transition-all disabled:opacity-40"
          style={{
            background: saved ? 'rgba(60,160,60,0.07)' : 'rgba(255,255,255,0.05)',
            border: saved ? '1px solid rgba(160,220,160,0.18)' : '1px solid rgba(255,255,255,0.12)',
            color: saved ? 'rgba(160,220,160,0.85)' : 'rgba(255,255,255,0.75)',
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