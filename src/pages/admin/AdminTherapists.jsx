import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/LanguageContext';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import AdminAuthGuard from '@/components/shared/AdminAuthGuard';

const EMPTY = {
  name_th: '', name_en: '', nickname: '', photo_url: '',
  bio_th: '', bio_en: '', rating: 5, is_active: true,
  work_start: '09:00', work_end: '20:00', line_user_id: '',
};

export default function AdminTherapists() {
  const { lang } = useLang();
  const queryClient = useQueryClient();
  const [editItem, setEditItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: therapists = [], isLoading } = useQuery({
    queryKey: ['admin-therapists'],
    queryFn: () => base44.entities.Therapist.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        const { id, ...rest } = data;
        return base44.entities.Therapist.update(id, rest);
      }
      return base44.entities.Therapist.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-therapists'] });
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Therapist.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-therapists'] }),
  });

  const handleOpenNew = () => { setEditItem({ ...EMPTY }); setDialogOpen(true); };

  return (
    <AdminAuthGuard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            {lang === 'th' ? 'เทอราปิส' : 'Therapists'}
          </h1>
          <Button onClick={handleOpenNew} className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            {lang === 'th' ? 'เพิ่ม' : 'Add'}
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : (
          <div className="grid gap-3">
            {therapists.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {t.photo_url ? (
                        <img src={t.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-muted-foreground">
                          {t.nickname?.[0] || '?'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{t.nickname} — {lang === 'th' ? t.name_th : t.name_en}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {t.rating}
                          </span>
                          {t.line_user_id ? (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              LINE ✓
                            </span>
                          ) : (
                            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                              {lang === 'th' ? 'ยังไม่มี LINE ID' : 'No LINE ID'}
                            </span>
                          )}
                          {!t.is_active && (
                            <span className="text-[10px] text-muted-foreground">(inactive)</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditItem(t); setDialogOpen(true); }} className="p-1.5 rounded-md hover:bg-secondary">
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => deleteMutation.mutate(t.id)} className="p-1.5 rounded-md hover:bg-destructive/10">
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editItem?.id ? (lang === 'th' ? 'แก้ไข' : 'Edit') : (lang === 'th' ? 'เพิ่ม' : 'Add')} {lang === 'th' ? 'เทอราปิส' : 'Therapist'}</DialogTitle>
            </DialogHeader>
            {editItem && (
              <TherapistForm
                therapist={editItem}
                onSave={(data) => saveMutation.mutate(data)}
                isSaving={saveMutation.isPending}
                lang={lang}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminAuthGuard>
  );
}

function TherapistForm({ therapist, onSave, isSaving, lang }) {
  const [form, setForm] = useState(therapist);
  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">ชื่อ (TH)</Label>
          <Input value={form.name_th} onChange={e => update('name_th', e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">Name (EN)</Label>
          <Input value={form.name_en} onChange={e => update('name_en', e.target.value)} className="mt-1" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Nickname</Label>
        <Input value={form.nickname} onChange={e => update('nickname', e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label className="text-xs">Photo URL</Label>
        <Input value={form.photo_url || ''} onChange={e => update('photo_url', e.target.value)} className="mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">{lang === 'th' ? 'เวลาเริ่ม' : 'Work Start'}</Label>
          <Input value={form.work_start || '09:00'} onChange={e => update('work_start', e.target.value)} className="mt-1" placeholder="09:00" />
        </div>
        <div>
          <Label className="text-xs">{lang === 'th' ? 'เวลาสิ้นสุด' : 'Work End'}</Label>
          <Input value={form.work_end || '20:00'} onChange={e => update('work_end', e.target.value)} className="mt-1" placeholder="20:00" />
        </div>
      </div>

      {/* LINE User ID for notifications */}
      <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
        <Label className="text-xs font-semibold">
          📱 {lang === 'th' ? 'LINE User ID (สำหรับแจ้งเตือน)' : 'LINE User ID (for notifications)'}
        </Label>
        <Input
          value={form.line_user_id || ''}
          onChange={e => update('line_user_id', e.target.value)}
          placeholder="U1234567890abcdef..."
          className="mt-1 font-mono text-xs"
        />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {lang === 'th'
            ? 'ใส่ LINE userId ของเทอราปิส เพื่อรับแจ้งเตือนเมื่อลูกค้าเช็คอิน (ดูได้จาก LINE Developers Console หรือ Webhook events)'
            : 'Enter therapist\'s LINE userId to receive check-in notifications (find it via LINE Developers Console or webhook events)'}
        </p>
      </div>

      <Button onClick={() => onSave(form)} disabled={isSaving} className="w-full">
        {lang === 'th' ? 'บันทึก' : 'Save'}
      </Button>
    </div>
  );
}