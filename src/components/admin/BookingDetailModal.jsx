import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, CalendarDays, CreditCard, FileText } from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'];

const STATUS_LABELS = {
  th: { pending: 'รอยืนยัน', confirmed: 'ยืนยันแล้ว', checked_in: 'เช็คอินแล้ว', in_progress: 'กำลังดำเนินการ', completed: 'เสร็จสิ้น', cancelled: 'ยกเลิก', no_show: 'ไม่มาตามนัด' },
  en: { pending: 'Pending', confirmed: 'Confirmed', checked_in: 'Checked In', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled', no_show: 'No Show' },
};

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  checked_in: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-gray-100 text-gray-600',
};

export default function BookingDetailModal({ booking, lang, onClose, onUpdate }) {
  const [status, setStatus] = useState(booking.status);
  const labels = STATUS_LABELS[lang] || STATUS_LABELS.en;

  const hasChanged = status !== booking.status;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-semibold text-base">
            {lang === 'th' ? 'รายละเอียดการจอง' : 'Booking Details'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer */}
          <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{booking.customer_name}</p>
              <p className="text-xs text-muted-foreground">{booking.service_name}</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2.5">
            <DetailRow icon={<CalendarDays className="w-4 h-4" />} label={lang === 'th' ? 'วันที่' : 'Date'} value={booking.booking_date} />
            <DetailRow icon={<Clock className="w-4 h-4" />} label={lang === 'th' ? 'เวลา' : 'Time'} value={`${booking.start_time} – ${booking.end_time}`} />
            <DetailRow icon={<User className="w-4 h-4" />} label={lang === 'th' ? 'นักบำบัด' : 'Therapist'} value={booking.therapist_name || (lang === 'th' ? 'ไม่ระบุ' : 'Unassigned')} />
            <DetailRow
              icon={<CreditCard className="w-4 h-4" />}
              label={lang === 'th' ? 'ยอดชำระ' : 'Amount'}
              value={`฿${Number(booking.price || 0).toLocaleString()}`}
            />
            {booking.staff_notes && (
              <DetailRow icon={<FileText className="w-4 h-4" />} label={lang === 'th' ? 'หมายเหตุ' : 'Notes'} value={booking.staff_notes} />
            )}
          </div>

          {/* Status picker */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{lang === 'th' ? 'เปลี่ยนสถานะ' : 'Update Status'}</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                    status === s
                      ? `${STATUS_COLORS[s]} border-current`
                      : 'bg-transparent border-border text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {labels[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1 h-9 text-sm" onClick={onClose}>
              {lang === 'th' ? 'ปิด' : 'Close'}
            </Button>
            {hasChanged && (
              <Button className="flex-1 h-9 text-sm" onClick={() => onUpdate(booking.id, { status })}>
                {lang === 'th' ? 'บันทึก' : 'Save'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 flex justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-medium text-foreground text-right">{value}</span>
      </div>
    </div>
  );
}