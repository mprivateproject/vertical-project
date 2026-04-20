import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CalendarDays, ExternalLink, User, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const E = [0.22, 1, 0.36, 1];

const statusLabel = {
  pending:    { th: 'รอยืนยัน',     en: 'Pending' },
  confirmed:  { th: 'ยืนยันแล้ว',   en: 'Confirmed' },
  checked_in: { th: 'เช็คอินแล้ว',  en: 'Checked In' },
  in_progress:{ th: 'กำลังดำเนินการ',en: 'In Progress' },
  completed:  { th: 'เสร็จสิ้น',    en: 'Completed' },
  cancelled:  { th: 'ยกเลิก',       en: 'Cancelled' },
  no_show:    { th: 'ไม่มาตามนัด',  en: 'No Show' },
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

function downloadAppleCalendar(booking) {
  const dateStr = booking.booking_date.replace(/-/g, '');
  const [sh, sm] = booking.start_time.split(':').map(Number);
  const [eh, em] = (booking.end_time || booking.start_time).split(':').map(Number);
  const start = `${dateStr}T${String(sh).padStart(2,'0')}${String(sm).padStart(2,'0')}00`;
  const end   = `${dateStr}T${String(eh).padStart(2,'0')}${String(em).padStart(2,'0')}00`;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vertical Project//EN',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${booking.service_name || 'Wellness Session'}`,
    `DESCRIPTION:${booking.therapist_name ? 'Therapist: ' + booking.therapist_name : 'Vertical Project'}`,
    `LOCATION:Vertical Project`,
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'booking.ics';
  a.click();
  URL.revokeObjectURL(url);
}

export default function BookingDetailSheet({ booking, onClose, onCancel, today, lang, locale, t }) {
  if (!booking) return null;

  const dateObj = new Date(booking.booking_date + 'T00:00:00');
  const fullDate = format(dateObj, 'EEEE, d MMMM yyyy', { locale });
  const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}:00`);
  const twoHoursBefore = new Date(bookingDateTime.getTime() - 2 * 60 * 60 * 1000);
  const canCancel = (booking.status === 'pending' || booking.status === 'confirmed') && new Date() < twoHoursBefore;
  const status = statusLabel[booking.status] || { th: booking.status, en: booking.status };
  const payment = paymentLabel[booking.payment_status] || { th: booking.payment_status, en: booking.payment_status };

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
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
          </div>

          {/* Close + Cancel icons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {canCancel && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onCancel(booking.id)}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
                style={{ background: 'rgba(180,60,60,0.15)', color: 'rgba(220,100,100,0.8)' }}
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(161,165,173,0.6)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 pb-10 pt-4 space-y-6">
            {/* Title section */}
            <div>
              <p className="text-[9px] tracking-[0.3em] uppercase mb-1.5"
                style={{ color: 'rgba(161,165,173,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
                Wellness · Massage
              </p>
              <h2
                className="text-[22px] font-light leading-snug"
                style={{ color: 'rgba(255,255,255,0.92)', fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '0.01em' }}
              >
                {booking.service_name}
              </h2>
            </div>

            {/* Meta rows */}
            <div className="space-y-3">
              <MetaRow icon={<CalendarDays className="w-3.5 h-3.5" />} value={fullDate} />
              <MetaRow
                icon={<Clock className="w-3.5 h-3.5" />}
                value={`${booking.start_time}${booking.end_time ? ' – ' + booking.end_time : ''}${booking.duration_minutes ? ' · ' + booking.duration_minutes + ' ' + (lang === 'th' ? 'นาที' : 'min') : ''}`}
              />
              {booking.therapist_name && (
                <MetaRow icon={<User className="w-3.5 h-3.5" />} value={booking.therapist_name} />
              )}
            </div>

            {/* Status / Price row */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase mb-1"
                  style={{ color: 'rgba(161,165,173,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
                  {lang === 'th' ? 'สถานะ' : 'Status'}
                </p>
                <p className="text-[13px] font-light" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {status[lang]}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] tracking-[0.2em] uppercase mb-1"
                  style={{ color: 'rgba(161,165,173,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
                  {lang === 'th' ? 'ราคา' : 'Price'}
                </p>
                <p className="text-[17px] font-semibold tabular-nums" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  ฿{booking.price?.toLocaleString()}
                </p>
                <p className="text-[10px]" style={{ color: 'rgba(161,165,173,0.4)' }}>
                  {payment[lang]}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              {/* Add to Google Calendar */}
              <motion.a
                href={buildGoogleCalendarUrl(booking)}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-[12px] font-medium tracking-[0.12em] uppercase transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="4" fill="white" fillOpacity="0.08"/>
                  <path d="M6 2v2M18 2v2M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M9.5 12.5l1.5 1.5 3.5-3.5" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {lang === 'th' ? 'เพิ่มใน Google Calendar' : 'Add to Google Calendar'}
                <ExternalLink className="w-3 h-3 opacity-40" />
              </motion.a>

              {/* Add to Apple Calendar */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => downloadAppleCalendar(booking)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-[12px] font-medium tracking-[0.12em] uppercase transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                {lang === 'th' ? 'เพิ่มใน Apple Calendar' : 'Add to Apple Calendar'}
              </motion.button>


            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function MetaRow({ icon, value }) {
  return (
    <div className="flex items-center gap-3">
      <span style={{ color: 'rgba(161,165,173,0.35)' }}>{icon}</span>
      <span className="text-[13px] font-light tracking-wide" style={{ color: 'rgba(255,255,255,0.6)' }}>
        {value}
      </span>
    </div>
  );
}