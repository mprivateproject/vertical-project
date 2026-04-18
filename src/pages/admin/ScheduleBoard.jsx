import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { liffSyncClient } from '@/lib/liffSyncClient';
import { useLang } from '@/lib/LanguageContext';
import { format, addDays, isToday } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, User, GripVertical, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import BookingDetailModal from '@/components/admin/BookingDetailModal';

// Time config: 09:00 - 21:00, each slot = 30min
const START_HOUR = 9;
const END_HOUR = 21;
const SLOT_HEIGHT = 48; // px per 30min

function getTimeSlots() {
  const slots = [];
  for (let h = START_HOUR; h <= END_HOUR; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < END_HOUR) slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
}
const TIME_SLOTS = getTimeSlots();

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getBookingTop(startTime) {
  const mins = timeToMinutes(startTime) - START_HOUR * 60;
  return (mins / 30) * SLOT_HEIGHT;
}

function getBookingHeight(startTime, endTime) {
  const dur = timeToMinutes(endTime) - timeToMinutes(startTime);
  return Math.max((dur / 30) * SLOT_HEIGHT, SLOT_HEIGHT);
}

const STATUS_COLORS = {
  pending:    'bg-amber-100 border-amber-400 text-amber-900',
  confirmed:  'bg-blue-100 border-blue-400 text-blue-900',
  checked_in: 'bg-purple-100 border-purple-400 text-purple-900',
  in_progress:'bg-indigo-100 border-indigo-400 text-indigo-900',
  completed:  'bg-green-100 border-green-400 text-green-900',
  cancelled:  'bg-red-100 border-red-300 text-red-600 opacity-50',
  no_show:    'bg-gray-100 border-gray-300 text-gray-500 opacity-60',
};

export default function ScheduleBoard() {
  const { lang } = useLang();
  const locale = lang === 'th' ? th : enUS;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [viewDate, setViewDate] = useState(new Date());
  const [dragging, setDragging] = useState(null); // { bookingId, offsetMins }
  const [dropTarget, setDropTarget] = useState(null); // { therapistId, time }
  const [selectedBooking, setSelectedBooking] = useState(null);
  const gridRef = useRef(null);

  const dateStr = format(viewDate, 'yyyy-MM-dd');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['schedule-board', dateStr],
    queryFn: async () => {
      const result = await liffSyncClient.call({ url: '/functions/liffSync', method: 'POST', data: { action: 'adminGetBookingsByDate', bookingDate: dateStr } });
      return result.bookings || [];
    },
  });

  const { data: therapists = [] } = useQuery({
    queryKey: ['therapists'],
    queryFn: async () => {
      const result = await liffSyncClient.call({ url: '/functions/liffSync', method: 'POST', data: { action: 'getTherapists' } });
      return result.therapists || [];
    },
  });

  const updateBooking = useMutation({
    mutationFn: async ({ id, data }) => {
      const result = await liffSyncClient.call({ url: '/functions/liffSync', method: 'POST', data: { action: 'adminUpdateBooking', bookingId: id, data } });
      return result.booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-board'] });
      toast({ title: lang === 'th' ? 'อัปเดตสำเร็จ' : 'Updated successfully' });
    },
    onError: () => {
      toast({ title: lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Update failed', variant: 'destructive' });
    },
  });

  // Build "unassigned" column for bookings without therapist
  const columns = [
    { id: '__unassigned__', nickname: lang === 'th' ? 'ไม่ระบุ' : 'Unassigned', name_th: 'ไม่ระบุ', name_en: 'Unassigned' },
    ...therapists,
  ];

  function getColumnBookings(col) {
    if (col.id === '__unassigned__') {
      return bookings.filter(b => !b.therapist_id || !therapists.find(t => t.id === b.therapist_id));
    }
    return bookings.filter(b => b.therapist_id === col.id);
  }

  // Drag handlers
  function onDragStart(e, booking) {
    const offsetMins = 0;
    setDragging({ bookingId: booking.id, offsetMins });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', booking.id);
  }

  function onDragOver(e, therapistId, slotTime) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget({ therapistId, slotTime });
  }

  function onDrop(e, therapistId, slotTime) {
    e.preventDefault();
    if (!dragging) return;
    const booking = bookings.find(b => b.id === dragging.bookingId);
    if (!booking) return;

    const dur = timeToMinutes(booking.end_time) - timeToMinutes(booking.start_time);
    const newStart = slotTime;
    const newEnd = minutesToTime(timeToMinutes(newStart) + dur);

    const therapist = therapists.find(t => t.id === therapistId);
    const updateData = {
      start_time: newStart,
      end_time: newEnd,
    };
    if (therapistId !== '__unassigned__') {
      updateData.therapist_id = therapistId;
      updateData.therapist_name = therapist?.nickname || therapist?.name_th || '';
    } else {
      updateData.therapist_id = '';
      updateData.therapist_name = '';
    }

    // Only update if something changed
    if (
      booking.start_time !== newStart ||
      booking.end_time !== newEnd ||
      booking.therapist_id !== (therapistId === '__unassigned__' ? '' : therapistId)
    ) {
      updateBooking.mutate({ id: booking.id, data: updateData });
    }

    setDragging(null);
    setDropTarget(null);
  }

  function onDragEnd() {
    setDragging(null);
    setDropTarget(null);
  }

  const totalHeight = TIME_SLOTS.length * SLOT_HEIGHT;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            {lang === 'th' ? 'ตารางงาน (Drag & Drop)' : 'Schedule Board'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {lang === 'th' ? 'ลากการจองเพื่อเปลี่ยนเวลาหรือนักบำบัด' : 'Drag bookings to reschedule or reassign therapist'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewDate(d => addDays(d, -1))} className="p-2 rounded-lg hover:bg-secondary border border-border">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center min-w-[160px]">
            <p className={`font-semibold text-sm ${isToday(viewDate) ? 'text-primary' : 'text-foreground'}`}>
              {isToday(viewDate) ? (lang === 'th' ? 'วันนี้' : 'Today') + ' · ' : ''}
              {format(viewDate, 'd MMM yyyy', { locale })}
            </p>
          </div>
          <button onClick={() => setViewDate(d => addDays(d, 1))} className="p-2 rounded-lg hover:bg-secondary border border-border">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewDate(new Date())}
            className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-secondary font-medium"
          >
            {lang === 'th' ? 'วันนี้' : 'Today'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: lang === 'th' ? 'ทั้งหมด' : 'Total', count: bookings.filter(b => b.status !== 'cancelled').length, cls: 'bg-secondary text-foreground' },
          { label: lang === 'th' ? 'ยืนยันแล้ว' : 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length, cls: 'bg-blue-50 text-blue-800' },
          { label: lang === 'th' ? 'กำลังรับบริการ' : 'In Progress', count: bookings.filter(b => b.status === 'in_progress').length, cls: 'bg-indigo-50 text-indigo-800' },
          { label: lang === 'th' ? 'เสร็จสิ้น' : 'Completed', count: bookings.filter(b => b.status === 'completed').length, cls: 'bg-green-50 text-green-800' },
        ].map(s => (
          <div key={s.label} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${s.cls}`}>
            <span>{s.label}</span>
            <span className="font-bold">{s.count}</span>
          </div>
        ))}
      </div>

      {/* Hint */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        <span>{lang === 'th' ? 'ลากการ์ดการจองไปยังช่องเวลาที่ต้องการ · คลิกเพื่อดูรายละเอียด' : 'Drag booking cards to reschedule · Click to view details'}</span>
      </div>

      {/* Board */}
      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          {lang === 'th' ? 'กำลังโหลด...' : 'Loading...'}
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <div ref={gridRef} style={{ minWidth: `${80 + columns.length * 160}px` }}>
              {/* Column headers */}
              <div className="flex border-b border-border bg-muted/60 sticky top-0 z-10">
                <div className="w-20 shrink-0 p-3 border-r border-border" />
                {columns.map(col => (
                  <div key={col.id} className="flex-1 min-w-[160px] p-3 border-r border-border text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-foreground truncate">
                        {lang === 'th' ? (col.nickname || col.name_th) : (col.name_en || col.nickname)}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {getColumnBookings(col).filter(b => b.status !== 'cancelled').length} {lang === 'th' ? 'คิว' : 'bookings'}
                    </p>
                  </div>
                ))}
              </div>

              {/* Grid body */}
              <div className="flex" style={{ height: totalHeight }}>
                {/* Time axis */}
                <div className="w-20 shrink-0 border-r border-border relative">
                  {TIME_SLOTS.map((slot, i) => (
                    <div
                      key={slot}
                      className="absolute right-0 left-0 border-t border-border/40 flex items-start justify-end pr-2"
                      style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                    >
                      {slot.endsWith(':00') && (
                        <span className="text-[10px] text-muted-foreground -mt-2">{slot}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Therapist columns */}
                {columns.map(col => {
                  const colBookings = getColumnBookings(col);
                  return (
                    <div key={col.id} className="flex-1 min-w-[160px] border-r border-border relative" style={{ height: totalHeight }}>
                      {/* Drop zones */}
                      {TIME_SLOTS.map((slot, i) => {
                        const isTarget = dropTarget?.therapistId === col.id && dropTarget?.slotTime === slot;
                        return (
                          <div
                            key={slot}
                            className={`absolute left-0 right-0 border-t transition-colors ${
                              slot.endsWith(':00') ? 'border-border/40' : 'border-border/20'
                            } ${isTarget ? 'bg-primary/10' : ''}`}
                            style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                            onDragOver={(e) => onDragOver(e, col.id, slot)}
                            onDrop={(e) => onDrop(e, col.id, slot)}
                          />
                        );
                      })}

                      {/* Bookings */}
                      {colBookings.map(booking => {
                        const top = getBookingTop(booking.start_time);
                        const height = getBookingHeight(booking.start_time, booking.end_time);
                        const isDragged = dragging?.bookingId === booking.id;

                        return (
                          <div
                            key={booking.id}
                            draggable={!['completed', 'cancelled', 'no_show'].includes(booking.status)}
                            onDragStart={(e) => onDragStart(e, booking)}
                            onDragEnd={onDragEnd}
                            onClick={() => setSelectedBooking(booking)}
                            className={`absolute left-1 right-1 rounded-lg border-l-4 px-2 py-1 cursor-grab active:cursor-grabbing select-none transition-opacity group
                              ${STATUS_COLORS[booking.status] || 'bg-secondary border-border'}
                              ${isDragged ? 'opacity-30' : 'opacity-100 hover:shadow-md hover:-translate-y-0.5 transition-transform'}`}
                            style={{ top: top + 2, height: height - 4, zIndex: isDragged ? 0 : 5 }}
                          >
                            <div className="flex items-start gap-1 h-full overflow-hidden">
                              {!['completed', 'cancelled', 'no_show'].includes(booking.status) && (
                                <GripVertical className="w-3 h-3 mt-0.5 shrink-0 opacity-40 group-hover:opacity-70" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-semibold truncate leading-tight">{booking.customer_name}</p>
                                {height >= 56 && (
                                  <p className="text-[10px] opacity-70 truncate">{booking.service_name}</p>
                                )}
                                {height >= 80 && (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <Clock className="w-2.5 h-2.5 opacity-60" />
                                    <span className="text-[10px] opacity-70">{booking.start_time}–{booking.end_time}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking detail modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          lang={lang}
          onClose={() => setSelectedBooking(null)}
          onUpdate={(id, data) => {
            updateBooking.mutate({ id, data });
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}