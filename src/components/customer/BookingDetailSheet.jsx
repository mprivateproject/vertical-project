import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CalendarDays, CreditCard, ExternalLink, User } from 'lucide-react';
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

export default function BookingDetailSheet({ booking, onClose, onCancel, onDeposit, depositLoading, today, lang, locale, t }) {
  if (!booking) return null;

  const dateObj = new Date(booking.booking_date + 'T00:00:00');
  const fullDate = format(dateObj, 'EEEE, d MMMM yyyy', { locale });
  const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}:00`);
  const twoHoursBefore = new Date(bookingDateTime.getTime() - 2 * 60 * 60 * 1000);
  const canCancel = (booking.status === 'pending' || booking.status === 'confirmed') && new Date() < twoHoursBefore;
  const canDeposit = canCancel && (booking.payment_status === 'unpaid' || booking.payment_status === 'pending');
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

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(161,165,173,0.6)' }}
          >
            <X className="w-4 h-4" />
          </button>

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
                <CalendarDays className="w-3.5 h-3.5" />
                {lang === 'th' ? 'เพิ่มใน Google Calendar' : 'Add to Google Calendar'}
                <ExternalLink className="w-3 h-3 opacity-50" />
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
                <CalendarDays className="w-3.5 h-3.5" />
                {lang === 'th' ? 'เพิ่มใน Apple Calendar' : 'Add to Apple Calendar'}
              </motion.button>

              {/* Deposit */}
              {canDeposit && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onDeposit(booking)}
                  disabled={depositLoading === booking.id}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-[12px] font-medium tracking-[0.12em] uppercase transition-all disabled:opacity-40"
                  style={{
                    background: 'linear-gradient(150deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.05) 100%)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  {depositLoading === booking.id
                    ? '· · ·'
                    : lang === 'th' ? 'จ่ายมัดจำ ฿500' : 'Pay ฿500 Deposit'}
                </motion.button>
              )}

              {/* Cancel */}
              {canCancel && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onCancel(booking.id)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-[11px] tracking-[0.12em] uppercase transition-all"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.05)',
                    color: 'rgba(161,165,173,0.4)',
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