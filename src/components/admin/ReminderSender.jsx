import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminClient } from '@/lib/adminClient';
import { base44 } from '@/api/base44Client';
import { format, parseISO } from 'date-fns';
import { Bell, Send, X, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReminderSender({ lang }) {
  const [open, setOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [successMap, setSuccessMap] = useState({});

  // Fetch today + tomorrow bookings
  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const [todayRes, tomorrowRes] = await Promise.all([
        adminClient.getBookingsByDate(today),
        adminClient.getBookingsByDate(tomorrow),
      ]);
      const all = [...(todayRes || []), ...(tomorrowRes || [])]
        .filter(b => !['cancelled', 'completed', 'no_show'].includes(b.status))
        .sort((a, b) => a.booking_date.localeCompare(b.booking_date) || a.start_time.localeCompare(b.start_time));
      setBookings(all);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleToggle = () => {
    if (!open) loadBookings();
    setOpen(v => !v);
    setSelectedBooking(null);
    setCustomMessage('');
    setUseCustom(false);
  };

  const sendMutation = useMutation({
    mutationFn: async ({ bookingId, customMessage: msg }) => {
      const res = await base44.functions.invoke('liffSync', {
        action: 'adminSendReminder',
        bookingId,
        customMessage: msg || null,
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      setSuccessMap(prev => ({ ...prev, [variables.bookingId]: true }));
      setSelectedBooking(null);
      setCustomMessage('');
      setTimeout(() => {
        setSuccessMap(prev => { const n = { ...prev }; delete n[variables.bookingId]; return n; });
      }, 5000);
    },
  });

  const STATUS_LABEL = {
    pending: { th: 'รอดำเนินการ', en: 'Pending', color: 'bg-amber-100 text-amber-700' },
    confirmed: { th: 'ยืนยันแล้ว', en: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
    checked_in: { th: 'เช็คอินแล้ว', en: 'Checked In', color: 'bg-indigo-100 text-indigo-700' },
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3 cursor-pointer" onClick={handleToggle}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            {lang === 'th' ? '🔔 ส่งแจ้งเตือนนัดหมาย' : '🔔 Send Booking Reminders'}
          </CardTitle>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </CardHeader>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <CardContent className="pt-0 space-y-3">
              <p className="text-xs text-muted-foreground">
                {lang === 'th' ? 'นัดหมายวันนี้และพรุ่งนี้ (ไม่รวมที่ยกเลิก/เสร็จแล้ว)' : "Today & tomorrow's bookings (excluding cancelled/completed)"}
              </p>

              {loadingBookings ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}
                </div>
              ) : bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {lang === 'th' ? 'ไม่มีนัดหมายที่ต้องแจ้งเตือน' : 'No upcoming bookings to remind'}
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {bookings.map(b => {
                    const statusInfo = STATUS_LABEL[b.status] || STATUS_LABEL.pending;
                    const sent = successMap[b.id];
                    const isSelected = selectedBooking?.id === b.id;

                    return (
                      <div key={b.id} className="border border-border/50 rounded-xl overflow-hidden">
                        {/* Booking row */}
                        <div className="flex items-center gap-3 px-3 py-2.5">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-foreground truncate">
                                {b.customer_name || '—'}
                              </span>
                              <Badge className={`text-[10px] ${statusInfo.color}`}>
                                {lang === 'th' ? statusInfo.th : statusInfo.en}
                              </Badge>
                              {b.booking_date === tomorrow && (
                                <Badge variant="outline" className="text-[10px]">
                                  {lang === 'th' ? 'พรุ่งนี้' : 'Tomorrow'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {b.service_name} · {b.start_time}{b.end_time ? ` - ${b.end_time}` : ''}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {sent ? (
                              <span className="text-[11px] text-green-600 font-medium">✓ ส่งแล้ว</span>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedBooking(null);
                                      setCustomMessage('');
                                      setUseCustom(false);
                                    } else {
                                      setSelectedBooking(b);
                                      setCustomMessage('');
                                      setUseCustom(false);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                                  title={lang === 'th' ? 'ปรับข้อความ' : 'Custom message'}
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                                <button
                                  onClick={() => sendMutation.mutate({ bookingId: b.id, customMessage: '' })}
                                  disabled={sendMutation.isPending}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                >
                                  <Send className="w-3 h-3" />
                                  {lang === 'th' ? 'ส่ง' : 'Send'}
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Custom message panel */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18 }}
                              style={{ overflow: 'hidden' }}
                              className="border-t border-border/50 bg-secondary/30 px-3 py-3 space-y-2"
                            >
                              <p className="text-[11px] text-muted-foreground">
                                {lang === 'th' ? 'ข้อความที่กำหนดเอง (เว้นว่างเพื่อใช้ข้อความเริ่มต้น)' : 'Custom message (leave blank for default)'}
                              </p>
                              <Textarea
                                value={customMessage}
                                onChange={e => setCustomMessage(e.target.value)}
                                rows={4}
                                placeholder={lang === 'th' ? 'พิมพ์ข้อความที่ต้องการส่ง...' : 'Type your message...'}
                                className="text-xs resize-none"
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => { setSelectedBooking(null); setCustomMessage(''); }}
                                  className="px-3 py-1.5 rounded-lg text-xs border border-border hover:bg-secondary transition-colors"
                                >
                                  {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
                                </button>
                                <button
                                  onClick={() => sendMutation.mutate({ bookingId: b.id, customMessage })}
                                  disabled={sendMutation.isPending}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                >
                                  <Send className="w-3 h-3" />
                                  {lang === 'th' ? 'ส่งข้อความ' : 'Send'}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}