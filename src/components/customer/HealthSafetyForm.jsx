import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RotateCcw } from 'lucide-react';

const E = [0.22, 1, 0.36, 1];

const SECTIONS = [
  {
    id: 'medication',
    label_th: 'Medication / Substance',
    label_en: 'Medication / Substance',
    items: [
      { id: 'blood_thinner',   th: 'ยาละลายลิ่มเลือด',                          en: 'Blood thinners' },
      { id: 'painkiller',      th: 'ยาแก้ปวด / Muscle relaxant',                en: 'Painkillers / Muscle relaxants' },
      { id: 'stimulant',       th: 'สารกระตุ้น / Alcohol ภายใน 24 ชม.',        en: 'Stimulants / Alcohol within 24 hrs' },
    ],
  },
  {
    id: 'medical',
    label_th: 'Medical & Safety Screening',
    label_en: 'Medical & Safety Screening',
    items: [
      { id: 'bp',              th: 'ความดันโลหิตสูง / ต่ำ',                     en: 'High / Low blood pressure' },
      { id: 'heart',           th: 'โรคหัวใจ',                                  en: 'Heart condition' },
      { id: 'diabetes',        th: 'เบาหวาน',                                   en: 'Diabetes' },
      { id: 'osteoporosis',    th: 'กระดูกพรุน',                                en: 'Osteoporosis' },
      { id: 'varicose',        th: 'เส้นเลือดขอด',                              en: 'Varicose veins' },
      { id: 'herniated_disc',  th: 'หมอนรองกระดูกทับเส้น (Herniated disc)',    en: 'Herniated disc' },
      { id: 'surgery',         th: 'เคยผ่าตัด',                                 en: 'Previous surgery', hasNote: true },
      { id: 'pregnant',        th: 'ตั้งครรภ์',                                 en: 'Pregnant' },
    ],
  },
  {
    id: 'consent',
    label_th: 'Consent & Agreement',
    label_en: 'Consent & Agreement',
    items: [
      { id: 'consent_therapy', th: 'ข้าพเจ้ารับทราบว่าการนวดเป็นการผ่อนคลาย ไม่ใช่การรักษาทางการแพทย์', en: 'I acknowledge that massage is for relaxation, not medical treatment' },
      { id: 'consent_truth',   th: 'ข้าพเจ้าแจ้งข้อมูลสุขภาพตามจริงแล้ว',    en: 'I confirm the health information provided is accurate' },
    ],
  },
];

function Checkbox({ checked, onChange, label, hasNote, noteValue, onNoteChange, lang }) {
  return (
    <div className="space-y-1.5">
      <button
        onClick={onChange}
        className="w-full flex items-start gap-3 text-left py-2 transition-all"
      >
        <div
          className="w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center transition-all"
          style={{
            background: checked ? 'rgba(255,255,255,0.12)' : 'transparent',
            border: checked ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <AnimatePresence>
            {checked && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Check className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.9)' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span
          className="text-[13px] font-light leading-relaxed"
          style={{
            color: checked ? 'rgba(255,255,255,0.88)' : 'rgba(161,165,173,0.65)',
            fontFamily: 'Georgia, serif',
            transition: 'color 0.2s',
          }}
        >
          {label}
        </span>
      </button>
      {hasNote && checked && (
        <motion.div
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="ml-8 overflow-hidden"
        >
          <input
            type="text"
            value={noteValue || ''}
            onChange={e => onNoteChange(e.target.value)}
            placeholder={lang === 'th' ? 'ระบุรายละเอียด...' : 'Please specify...'}
            className="w-full px-3 py-2 rounded-xl text-[12px] outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.75)',
              fontFamily: 'Georgia, serif',
            }}
          />
        </motion.div>
      )}
    </div>
  );
}

function SignaturePad({ onHasSig, lang }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Set canvas internal size to match display size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };
    resize();
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    drawing.current = true;
    lastPos.current = getPos(e, canvasRef.current);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    if (!hasDrawn) {
      setHasDrawn(true);
      onHasSig(true);
    }
  };

  const endDraw = (e) => {
    e?.preventDefault();
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onHasSig(false);
  };

  const getDataUrl = () => canvasRef.current?.toDataURL('image/png');

  // Expose getDataUrl to parent via ref
  SignaturePad.getDataUrl = getDataUrl;

  return (
    <div className="space-y-2">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          height: '140px',
        }}
      >
        {/* Baseline */}
        <div className="absolute bottom-8 left-6 right-6 pointer-events-none"
          style={{ borderBottom: '1px dashed rgba(255,255,255,0.08)' }} />
        {/* Placeholder */}
        {!hasDrawn && (
          <p className="absolute inset-0 flex items-center justify-center text-[11px] pointer-events-none"
            style={{ color: 'rgba(161,165,173,0.3)', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.1em' }}>
            {lang === 'th' ? 'ลงลายมือชื่อที่นี่' : 'Sign here'}
          </p>
        )}
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair', display: 'block' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      {hasDrawn && (
        <button
          onClick={clear}
          className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase transition-opacity hover:opacity-70"
          style={{ color: 'rgba(161,165,173,0.45)', fontFamily: 'Montserrat, sans-serif' }}
        >
          <RotateCcw className="w-3 h-3" />
          {lang === 'th' ? 'ล้างลายเซ็น' : 'Clear'}
        </button>
      )}
    </div>
  );
}

export default function HealthSafetyForm({ onConfirm, onClose, lang = 'th' }) {
  const [checked, setChecked] = useState({});
  const [notes, setNotes] = useState({});
  const [hasSig, setHasSig] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const consentChecked =
    checked['consent_therapy'] && checked['consent_truth'];
  const canSubmit = consentChecked && hasSig;

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const setNote = (id, val) => setNotes(prev => ({ ...prev, [id]: val }));

  const handleConfirm = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const formData = {
      checked_items: Object.keys(checked).filter(k => checked[k]),
      notes,
      signature: SignaturePad.getDataUrl?.() || '',
    };
    await onConfirm(formData);
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        />

        {/* Sheet */}
        <motion.div
          className="relative w-full max-w-lg mx-auto"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.45, ease: E }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'linear-gradient(180deg, rgba(20,22,26,0.99) 0%, rgba(14,15,17,1) 100%)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderBottom: 'none',
            borderRadius: '28px 28px 0 0',
            boxShadow: '0 -20px 60px rgba(0,0,0,0.7)',
            maxHeight: '90dvh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(161,165,173,0.6)' }}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1 px-6 pt-3 pb-6 space-y-6">

            {/* Title */}
            <div>
              <p className="text-[9px] tracking-[0.3em] uppercase mb-1"
                style={{ color: 'rgba(161,165,173,0.35)', fontFamily: 'Montserrat, sans-serif' }}>
                Health & Safety
              </p>
              <h2
                className="text-[22px] font-light"
                style={{ color: 'rgba(255,255,255,0.92)', fontFamily: 'Georgia, serif', letterSpacing: '0.01em' }}
              >
                {lang === 'th' ? 'แบบคัดกรองสุขภาพ' : 'Health Screening Form'}
              </h2>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(161,165,173,0.4)' }}>
                {lang === 'th'
                  ? 'กรุณาทำเครื่องหมายรายการที่เกี่ยวข้องกับท่าน'
                  : 'Please check all items that apply to you'}
              </p>
            </div>

            {/* Sections */}
            {SECTIONS.map((section, si) => (
              <div key={section.id}>
                <p
                  className="text-[9px] font-semibold tracking-[0.25em] uppercase mb-3"
                  style={{ color: 'rgba(161,165,173,0.45)', fontFamily: 'Montserrat, sans-serif' }}
                >
                  {lang === 'th' ? section.label_th : section.label_en}
                </p>
                <div
                  className="rounded-2xl px-4 divide-y"
                  style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    divideColor: 'rgba(255,255,255,0.05)',
                  }}
                >
                  {section.items.map((item) => (
                    <Checkbox
                      key={item.id}
                      checked={!!checked[item.id]}
                      onChange={() => toggle(item.id)}
                      label={lang === 'th' ? item.th : item.en}
                      hasNote={item.hasNote}
                      noteValue={notes[item.id]}
                      onNoteChange={(val) => setNote(item.id, val)}
                      lang={lang}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Signature */}
            <div>
              <p
                className="text-[9px] font-semibold tracking-[0.25em] uppercase mb-3"
                style={{ color: 'rgba(161,165,173,0.45)', fontFamily: 'Montserrat, sans-serif' }}
              >
                {lang === 'th' ? 'ลายมือชื่อ' : 'Signature'}
              </p>
              <SignaturePad onHasSig={setHasSig} lang={lang} />
              {!consentChecked && (
                <p className="text-[10px] mt-2" style={{ color: 'rgba(200,120,120,0.6)' }}>
                  {lang === 'th' ? '* กรุณายืนยัน Consent & Agreement ก่อนลงชื่อ' : '* Please confirm Consent & Agreement first'}
                </p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleConfirm}
              disabled={!canSubmit || submitting}
              className="w-full py-4 rounded-2xl text-[12px] font-semibold tracking-[0.22em] uppercase transition-all disabled:opacity-30"
              style={{
                background: canSubmit
                  ? 'linear-gradient(150deg, rgba(60,160,60,0.15) 0%, rgba(40,120,40,0.1) 100%)'
                  : 'rgba(255,255,255,0.03)',
                border: canSubmit ? '1px solid rgba(160,220,160,0.2)' : '1px solid rgba(255,255,255,0.07)',
                color: canSubmit ? 'rgba(160,220,160,0.9)' : 'rgba(255,255,255,0.3)',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {submitting ? '· · ·' : (lang === 'th' ? 'ยืนยันเช็คอิน' : 'Confirm Check-In')}
            </motion.button>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}