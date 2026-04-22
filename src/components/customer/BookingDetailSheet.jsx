import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CalendarDays, ExternalLink, User, MessageSquare, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useSheet } from '@/lib/SheetContext';
import { base44 } from '@/api/base44Client';

const E = [0.22, 1, 0.36, 1];

const statusLabel = {
  pending:     { th: 'รอยืนยัน',       en: 'Pending' },
  confirmed:   { th: 'ยืนยันแล้ว',     en: 'Confirmed' },
  checked_in:  { th: 'เช็คอินแล้ว',    en: 'Checked In' },
  in_progress: { th: 'กำลังดำเนินการ', en: 'In Progress' },
  completed:   { th: 'เสร็จสิ้น',      en: 'Completed' },
  cancelled:   { th: 'ยกเลิก',         en: 'Cancelled' },
  no_show:     { th: 'ไม่มาตามนัด',    en: 'No Show' },
};

const paymentLabel = {
  unpaid:   { th: 'ยังไม่ชำระ', en: 'Unpaid' },
  pending:  { th: 'รอชำระ',     en: 'Pending' },
  paid:     { th: 'ชำระแล้ว',   en: 'Paid' },
  refunded: { th: 'คืนเงินแล้ว', en: 'Refunded' },
};

function buildGoogleCalendarUrl(booking) {
  const dateStr = booking.booking_date.replace(/-/g, '');
  const [sh, sm] = booking.start_time.split(':').map(Number);
  const [eh, em] = (booking.end_time || booking.start_time).split(':').map(Number);
  const start = `${dateStr}T${String(sh).padStart(2,'0')}${String(sm).padStart(2,'0')}00`;
  const end   = `${dateStr}T${String(eh).padStart(2,'0')}${String(em).padStart(2,'0')}00`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: booking.service_name || 'Wellness Session',
    dates: `${start}/${end}`,
    details: `${booking.therapist_name ? 'Therapist: ' + booking.therapist_name : ''}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function BookingDetailSheet({ booking, onClose, onCancel, today, lang, locale, t }) {
  const { setSheetOpen } = useSheet();
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);

  useEffect(() => {
    setSheetOpen(!!booking);
    return () => setSheetOpen(false);
  }, [booking]);

  useEffect(() => {
    if (booking) {
      setNoteText(booking.customer_notes || '');
      setNoteSaved(false);
      setShowNoteInput(false);
    }
  }, [booking?.id]);

  if (!booking) return null;

  const dateObj = new Date(booking.booking_date + 'T00:00:00');
  const fullDate = format(dateObj, 'EEEE, d MMMM yyyy', { locale });
  const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}:00`);
  const twoHoursBefore = new Date(bookingDateTime.getTime() - 2 * 60 * 60 * 1000);
  const canCancel = (booking.status === 'pending' || booking.status === 'confirmed') && new Date() < twoHoursBefore;
  const status = statusLabel[booking.status] || { th: booking.status, en: booking.status };
  const payment = paymentLabel[booking.payment_status] || { th: booking.payment_status, en: booking.payment_status };

  const handleSaveNote = async () => {
    setNoteSaving(true);
    await base44.entities.Booking.update(booking.id, { customer_notes: noteText });
    setNoteSaving(false);
    setNoteSaved(true);
    setShowNoteInput(false);
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
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} />

        {/* Sheet */}
        <motion.div
          className="relative w-full max-w-lg mx-auto"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.45, ease: E }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'linear-gradient(180deg, rgba(28,30,35,0.98) 0%, rgba(20,22,26,0.99) 100%)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderBottom: 'none',
            borderRadius: '28px 28px 0 0',
            boxShadow: '0 -20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(161,165,173,0.6)' }}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="px-7 pb-12 pt-3 space-y-8">

            {/* ── TITLE BLOCK ── */}
            <div className="space-y-1.5">
              <p className="text-[12px] tracking-[0.3em] uppercase"
                style={{ color: 'rgba(161,165,173,0.35)', fontFamily: 'Montserrat, sans-serif' }}>
                Wellness · Massage
              </p>
              <h2
                className="text-[30px] font-light leading-tight"
                style={{ color: 'rgba(255,255,255,0.95)', fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '0.01em' }}
              >
                {booking.service_name}
              </h2>
            </div>

            {/* ── DATE / TIME / THERAPIST ── */}
            <div className="space-y-4">
              <MetaRow
                icon={<CalendarDays className="w-4 h-4" />}
                label={lang === 'th' ? 'วันที่' : 'Date'}
                value={fullDate}
                large
              />
              <MetaRow
                icon={<Clock className="w-4 h-4" />}
                label={lang === 'th' ? 'เวลา' : 'Time'}
                value={`${booking.start_time}${booking.end_time ? ' – ' + booking.end_time : ''}${booking.duration_minutes ? ' · ' + booking.duration_minutes + (lang === 'th' ? ' นาที' : ' min') : ''}`}
                large
              />
              {booking.therapist_name && (
                <MetaRow
                  icon={<User className="w-4 h-4" />}
                  label={lang === 'th' ? 'นักบำบัด' : 'Therapist'}
                  value={booking.therapist_name}
                />
              )}
            </div>

            {/* ── STATUS / PRICE CARD ── */}
            <div
              className="flex items-center justify-between px-5 py-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div>
                <p className="text-[12px] tracking-[0.2em] uppercase mb-1.5"
                  style={{ color: 'rgba(161,165,173,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
                  {lang === 'th' ? 'สถานะ' : 'Status'}
                </p>
                <p className="text-[17px] font-light" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {status[lang]}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[12px] tracking-[0.2em] uppercase mb-1.5"
                  style={{ color: 'rgba(161,165,173,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
                  {lang === 'th' ? 'ราคา' : 'Price'}
                </p>
                <p className="text-[24px] font-semibold tabular-nums" style={{ color: 'rgba(255,255,255,0.92)' }}>
                  ฿{booking.price?.toLocaleString()}
                </p>
                <p className="text-[13px] mt-0.5" style={{ color: 'rgba(161,165,173,0.4)' }}>
                  {payment[lang]}
                </p>
              </div>
            </div>

            {/* ── ACTIONS ── */}
            <div className="space-y-3">

              {/* Add to Google Calendar */}
              <motion.a
                href={buildGoogleCalendarUrl(booking)}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-[15px] font-medium tracking-[0.12em] uppercase transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                {lang === 'th' ? 'เพิ่มใน Google Calendar' : 'Add to Google Calendar'}
                <ExternalLink className="w-3 h-3 opacity-50" />
              </motion.a>

              {/* Note button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowNoteInput(v => !v)}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-[15px] font-medium tracking-[0.12em] uppercase transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: noteSaved ? 'rgba(160,210,160,0.8)' : 'rgba(255,255,255,0.65)',
                }}
              >
                {noteSaved ? <Check className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                {noteSaved
                  ? (lang === 'th' ? 'บันทึกโน้ตแล้ว' : 'Note Saved')
                  : (lang === 'th' ? 'โน้ตถึงนักบำบัด' : 'Leave a Note')}
              </motion.button>

              {/* Note textarea */}
              <AnimatePresence>
                {showNoteInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: E }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        placeholder={lang === 'th'
                          ? 'แจ้งความต้องการพิเศษ เช่น แรงกดที่ชอบ จุดที่ต้องการเน้น...'
                          : 'Any special requests, e.g. pressure preference, focus areas...'}
                        rows={3}
                        className="w-full px-4 py-3 rounded-2xl text-[16px] resize-none outline-none"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.8)',
                          fontFamily: 'Georgia, serif',
                        }}
                      />
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSaveNote}
                        disabled={noteSaving}
                        className="w-full py-3 rounded-2xl text-[15px] font-semibold tracking-[0.15em] uppercase disabled:opacity-40"
                        style={{
                          background: 'linear-gradient(150deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                          border: '1px solid rgba(255,255,255,0.14)',
                          color: 'rgba(255,255,255,0.9)',
                        }}
                      >
                        {noteSaving ? '· · ·' : (lang === 'th' ? 'บันทึก' : 'Save')}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cancel */}
              {canCancel && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onCancel(booking.id)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-[14px] tracking-[0.12em] uppercase transition-all"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.05)',
                    color: 'rgba(161,165,173,0.4)',
                    opacity: 0.5,
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                  {lang === 'th' ? 'ยกเลิกนัดหมาย' : 'Cancel Booking'}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function MetaRow({ icon, label, value, large }) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="mt-0.5 flex-shrink-0" style={{ color: 'rgba(161,165,173,0.35)' }}>{icon}</span>
      <div>
        <p className="text-[12px] tracking-[0.2em] uppercase mb-0.5"
          style={{ color: 'rgba(161,165,173,0.35)', fontFamily: 'Montserrat, sans-serif' }}>
          {label}
        </p>
        <span
          className={large ? 'text-[18px] font-light' : 'text-[16px] font-light'}
          style={{ color: 'rgba(255,255,255,0.75)', letterSpacing: '0.01em' }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}