import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminClient } from '@/lib/adminClient';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/LanguageContext';
import { format } from 'date-fns';
import {
  Search, Plus, Filter, ChevronDown, X, Check,
  CalendarDays, Clock, User, DollarSign, RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import AdminAuthGuard from '@/components/shared/AdminAuthGuard';

const STATUS_STYLES = {
  pending:     { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',  label: 'Pending' },
  confirmed:   { bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',     label: 'Confirmed' },
  checked_in:  { bg: 'bg-indigo-100 text-indigo-700',                                         label: 'Checked In' },
  in_progress: { bg: 'bg-violet-100 text-violet-700',                                         label: 'In Progress' },
  completed:   { bg: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400', label: 'Completed' },
  cancelled:   { bg: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',         label: 'Cancelled' },
  no_show:     { bg: 'bg-gray-100 text-gray-600',                                             label: 'No Show' },
};

const PAYMENT_STYLES = {
  unpaid:   'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  pending:  'bg-amber-100 text-amber-700',
  paid:     'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  refunded: 'bg-gray-100 text-gray-600',
};

const STATUSES = ['pending', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'];
const PAYMENT_STATUSES = ['unpaid', 'pending', 'paid', 'refunded'];
const PAYMENT_METHODS = ['promptpay', 'bank_transfer', 'truemoney', 'rabbit_line_pay', 'credit_card', 'cash'];

export default function AdminBookings() {
  const { lang } = useLang();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-all-bookings-manage'],
    queryFn: () => adminClient.getAllBookings('-booking_date', 1000),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => adminClient.getServices(),
  });

  const { data: therapists = [] } = useQuery({
    queryKey: ['therapists'],
    queryFn: () => base44.entities.Therapist.filter({ is_active: true }),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => adminClient.getCustomers(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminClient.updateBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-bookings-manage'] });
      setSelectedBooking(null);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Booking.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-bookings-manage'] });
      setShowCreateDialog(false);
    },
  });

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      const matchSearch = !search ||
        (b.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.service_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.therapist_name || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || b.status === filterStatus;
      const matchPayment = filterPayment === 'all' || b.payment_status === filterPayment;
      return matchSearch && matchStatus && matchPayment;
    });
  }, [bookings, search, filterStatus, filterPayment]);

  return (
    <AdminAuthGuard>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">
              {lang === 'th' ? 'จัดการการจอง' : 'Booking Management'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filtered.length} {lang === 'th' ? 'รายการ' : 'bookings'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              {lang === 'th' ? 'รีเฟรช' : 'Refresh'}
            </Button>
            <Button size="sm" onClick={() => setShowCreateDialog(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              {lang === 'th' ? 'สร้างการจอง' : 'New Booking'}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[180px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={lang === 'th' ? 'ค้นหาชื่อ, บริการ, นักบำบัด...' : 'Search name, service, therapist...'}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="w-40">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{lang === 'th' ? 'ทุกสถานะ' : 'All Status'}</SelectItem>
                    {STATUSES.map(s => (
                      <SelectItem key={s} value={s}>{STATUS_STYLES[s].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <Select value={filterPayment} onValueChange={setFilterPayment}>
                  <SelectTrigger><SelectValue placeholder="Payment" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{lang === 'th' ? 'ทุกการชำระ' : 'All Payment'}</SelectItem>
                    {PAYMENT_STATUSES.map(s => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(search || filterStatus !== 'all' || filterPayment !== 'all') && (
                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterStatus('all'); setFilterPayment('all'); }}>
                  <X className="w-4 h-4 mr-1" /> {lang === 'th' ? 'ล้าง' : 'Clear'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {[1,2,3,4,5].map(i => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm">
                {lang === 'th' ? 'ไม่พบการจอง' : 'No bookings found'}
              </div>
            ) : (
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {[
                      lang === 'th' ? 'ลูกค้า' : 'Customer',
                      lang === 'th' ? 'บริการ' : 'Service',
                      lang === 'th' ? 'วันที่ / เวลา' : 'Date / Time',
                      lang === 'th' ? 'นักบำบัด' : 'Therapist',
                      lang === 'th' ? 'ราคา' : 'Price',
                      lang === 'th' ? 'สถานะ' : 'Status',
                      lang === 'th' ? 'ชำระเงิน' : 'Payment',
                      '',
                    ].map((h, i) => (
                      <th key={i} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b, i) => {
                    const ss = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
                    const ps = PAYMENT_STYLES[b.payment_status] || PAYMENT_STYLES.unpaid;
                    return (
                      <motion.tr
                        key={b.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(i * 0.02, 0.3) }}
                        className="border-b border-border/40 hover:bg-secondary/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedBooking(b)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold text-primary">
                                {(b.customer_name || '?').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-xs text-foreground max-w-[100px] truncate">
                              {b.customer_name || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-foreground max-w-[120px] truncate block">{b.service_name || '—'}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-xs font-medium text-foreground">{b.booking_date}</p>
                          <p className="text-[10px] text-muted-foreground">{b.start_time}{b.end_time ? ` – ${b.end_time}` : ''}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground">{b.therapist_name || '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold text-foreground">฿{(b.price || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${ss.bg}`}>
                            {ss.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${ps}`}>
                            {b.payment_status || 'unpaid'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                            onClick={e => { e.stopPropagation(); setSelectedBooking(b); }}
                          >
                            {lang === 'th' ? 'แก้ไข' : 'Edit'}
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Booking Dialog */}
      {selectedBooking && (
        <EditBookingDialog
          booking={selectedBooking}
          services={services}
          therapists={therapists}
          lang={lang}
          onClose={() => setSelectedBooking(null)}
          onSave={(id, data) => updateMutation.mutate({ id, data })}
          isSaving={updateMutation.isPending}
        />
      )}

      {/* Create Booking Dialog */}
      {showCreateDialog && (
        <CreateBookingDialog
          services={services}
          therapists={therapists}
          customers={customers}
          lang={lang}
          onClose={() => setShowCreateDialog(false)}
          onCreate={(data) => createMutation.mutate(data)}
          isCreating={createMutation.isPending}
        />
      )}
    </AdminAuthGuard>
  );
}

function EditBookingDialog({ booking, services, therapists, lang, onClose, onSave, isSaving }) {
  const [form, setForm] = useState({
    status: booking.status || 'pending',
    payment_status: booking.payment_status || 'unpaid',
    payment_method: booking.payment_method || '',
    therapist_id: booking.therapist_id || '',
    therapist_name: booking.therapist_name || '',
    booking_date: booking.booking_date || '',
    start_time: booking.start_time || '',
    end_time: booking.end_time || '',
    price: booking.price || 0,
    staff_notes: booking.staff_notes || '',
  });

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleTherapistChange = (id) => {
    const t = therapists.find(t => t.id === id);
    upd('therapist_id', id);
    upd('therapist_name', t?.nickname || '');
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            {lang === 'th' ? 'แก้ไขการจอง' : 'Edit Booking'}
          </DialogTitle>
        </DialogHeader>

        {/* Booking info (readonly) */}
        <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-sm mb-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-3.5 h-3.5" />
            <span className="font-medium text-foreground">{booking.customer_name}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{booking.service_name}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{lang === 'th' ? 'วันที่จอง' : 'Date'}</Label>
              <Input type="date" value={form.booking_date} onChange={e => upd('booking_date', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">{lang === 'th' ? 'เวลาเริ่ม' : 'Start Time'}</Label>
              <Input type="time" value={form.start_time} onChange={e => upd('start_time', e.target.value)} className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{lang === 'th' ? 'เวลาสิ้นสุด' : 'End Time'}</Label>
              <Input type="time" value={form.end_time} onChange={e => upd('end_time', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">{lang === 'th' ? 'ราคา (฿)' : 'Price (฿)'}</Label>
              <Input type="number" value={form.price} onChange={e => upd('price', Number(e.target.value))} className="mt-1" />
            </div>
          </div>

          <div>
            <Label className="text-xs">{lang === 'th' ? 'นักบำบัด' : 'Therapist'}</Label>
            <Select value={form.therapist_id} onValueChange={handleTherapistChange}>
              <SelectTrigger className="mt-1"><SelectValue placeholder={lang === 'th' ? 'เลือกนักบำบัด' : 'Select therapist'} /></SelectTrigger>
              <SelectContent>
                {therapists.map(t => <SelectItem key={t.id} value={t.id}>{t.nickname} ({t.name_th})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{lang === 'th' ? 'สถานะการจอง' : 'Booking Status'}</Label>
              <Select value={form.status} onValueChange={v => upd('status', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_STYLES[s].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{lang === 'th' ? 'สถานะชำระเงิน' : 'Payment Status'}</Label>
              <Select value={form.payment_status} onValueChange={v => upd('payment_status', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">{lang === 'th' ? 'วิธีชำระเงิน' : 'Payment Method'}</Label>
            <Select value={form.payment_method} onValueChange={v => upd('payment_method', v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder={lang === 'th' ? 'เลือกวิธีชำระ' : 'Select method'} /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m} className="capitalize">{m.replace('_', ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">{lang === 'th' ? 'หมายเหตุสำหรับเจ้าหน้าที่' : 'Staff Notes'}</Label>
            <textarea
              value={form.staff_notes}
              onChange={e => upd('staff_notes', e.target.value)}
              rows={3}
              className="mt-1 w-full text-sm rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              placeholder={lang === 'th' ? 'บันทึกข้อมูลเพิ่มเติม...' : 'Internal notes...'}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">{lang === 'th' ? 'ยกเลิก' : 'Cancel'}</Button>
            <Button onClick={() => onSave(booking.id, form)} disabled={isSaving} className="flex-1">
              {isSaving ? '...' : (lang === 'th' ? 'บันทึก' : 'Save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateBookingDialog({ services, therapists, customers, lang, onClose, onCreate, isCreating }) {
  const [form, setForm] = useState({
    customer_id: '',
    customer_name: '',
    service_id: '',
    service_name: '',
    therapist_id: '',
    therapist_name: '',
    booking_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '10:00',
    end_time: '11:00',
    duration_minutes: 60,
    price: 0,
    status: 'confirmed',
    payment_status: 'unpaid',
    payment_method: 'cash',
    staff_notes: '',
    user_id: '',
  });

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleServiceChange = (id) => {
    const s = services.find(s => s.id === id);
    upd('service_id', id);
    upd('service_name', lang === 'th' ? s?.name_th : s?.name_en);
    upd('price', s?.price || 0);
    upd('duration_minutes', s?.duration_minutes || 60);
  };

  const handleCustomerChange = (id) => {
    const c = customers.find(c => c.id === id);
    upd('customer_id', id);
    upd('customer_name', c?.display_name || '');
    upd('user_id', c?.user_id || c?.id || '');
  };

  const handleTherapistChange = (id) => {
    const t = therapists.find(t => t.id === id);
    upd('therapist_id', id);
    upd('therapist_name', t?.nickname || '');
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            {lang === 'th' ? 'สร้างการจองใหม่' : 'New Booking'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs">{lang === 'th' ? 'ลูกค้า' : 'Customer'}</Label>
            <Select value={form.customer_id} onValueChange={handleCustomerChange}>
              <SelectTrigger className="mt-1"><SelectValue placeholder={lang === 'th' ? 'เลือกลูกค้า' : 'Select customer'} /></SelectTrigger>
              <SelectContent>
                {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.display_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">{lang === 'th' ? 'บริการ' : 'Service'}</Label>
            <Select value={form.service_id} onValueChange={handleServiceChange}>
              <SelectTrigger className="mt-1"><SelectValue placeholder={lang === 'th' ? 'เลือกบริการ' : 'Select service'} /></SelectTrigger>
              <SelectContent>
                {services.map(s => <SelectItem key={s.id} value={s.id}>{lang === 'th' ? s.name_th : s.name_en}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">{lang === 'th' ? 'นักบำบัด' : 'Therapist'}</Label>
            <Select value={form.therapist_id} onValueChange={handleTherapistChange}>
              <SelectTrigger className="mt-1"><SelectValue placeholder={lang === 'th' ? 'เลือกนักบำบัด' : 'Select therapist'} /></SelectTrigger>
              <SelectContent>
                {therapists.map(t => <SelectItem key={t.id} value={t.id}>{t.nickname} ({t.name_th})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{lang === 'th' ? 'วันที่' : 'Date'}</Label>
              <Input type="date" value={form.booking_date} onChange={e => upd('booking_date', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">{lang === 'th' ? 'เวลาเริ่ม' : 'Start Time'}</Label>
              <Input type="time" value={form.start_time} onChange={e => upd('start_time', e.target.value)} className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{lang === 'th' ? 'ราคา (฿)' : 'Price (฿)'}</Label>
              <Input type="number" value={form.price} onChange={e => upd('price', Number(e.target.value))} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">{lang === 'th' ? 'สถานะ' : 'Status'}</Label>
              <Select value={form.status} onValueChange={v => upd('status', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_STYLES[s].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{lang === 'th' ? 'การชำระเงิน' : 'Payment Status'}</Label>
              <Select value={form.payment_status} onValueChange={v => upd('payment_status', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{lang === 'th' ? 'วิธีชำระ' : 'Payment Method'}</Label>
              <Select value={form.payment_method} onValueChange={v => upd('payment_method', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m} className="capitalize">{m.replace('_', ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">{lang === 'th' ? 'หมายเหตุ' : 'Notes'}</Label>
            <textarea
              value={form.staff_notes}
              onChange={e => upd('staff_notes', e.target.value)}
              rows={2}
              className="mt-1 w-full text-sm rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">{lang === 'th' ? 'ยกเลิก' : 'Cancel'}</Button>
            <Button
              onClick={() => onCreate(form)}
              disabled={isCreating || !form.customer_id || !form.service_id || !form.booking_date}
              className="flex-1"
            >
              {isCreating ? '...' : (lang === 'th' ? 'สร้างการจอง' : 'Create')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}