import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/LanguageContext';
import { Users, Clock, Edit2, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const DAYS_TH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const TIME_OPTIONS = [];
for (let h = 7; h <= 23; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`);
}

function TherapistRow({ therapist, lang, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    work_days: therapist.work_days || [],
    work_start: therapist.work_start || '09:00',
    work_end: therapist.work_end || '20:00',
  });

  const days = lang === 'th' ? DAYS_TH : DAYS_EN;

  function toggleDay(key) {
    setDraft(prev => ({
      ...prev,
      work_days: prev.work_days.includes(key)
        ? prev.work_days.filter(d => d !== key)
        : [...prev.work_days, key],
    }));
  }

  function handleSave() {
    onSave(therapist.id, draft);
    setEditing(false);
  }

  function handleCancel() {
    setDraft({
      work_days: therapist.work_days || [],
      work_start: therapist.work_start || '09:00',
      work_end: therapist.work_end || '20:00',
    });
    setEditing(false);
  }

  const displayName = lang === 'th'
    ? (therapist.nickname || therapist.name_th)
    : (therapist.name_en || therapist.nickname);

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {therapist.photo_url ? (
              <img src={therapist.photo_url} alt={displayName}
                className="w-10 h-10 rounded-full object-cover border border-border" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-semibold text-sm text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                {(therapist.work_days || []).map(d => DAYS_TH[DAY_KEYS.indexOf(d)] || d).join(', ') || (lang === 'th' ? 'ยังไม่กำหนด' : 'Not set')}
              </p>
            </div>
          </div>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1.5">
              <Edit2 className="w-3.5 h-3.5" />
              {lang === 'th' ? 'แก้ไข' : 'Edit'}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="gap-1">
                <Check className="w-3.5 h-3.5" />
                {lang === 'th' ? 'บันทึก' : 'Save'}
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="gap-1">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Edit form */}
        {editing && (
          <div className="space-y-4 pt-2 border-t border-border/40">
            {/* Work days */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {lang === 'th' ? 'วันทำงาน' : 'Work Days'}
              </p>
              <div className="flex flex-wrap gap-2">
                {DAY_KEYS.map((key, i) => {
                  const active = draft.work_days.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleDay(key)}
                      className={`w-10 h-10 rounded-full text-xs font-semibold border transition-colors ${
                        active
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-muted-foreground border-border hover:bg-secondary'
                      }`}
                    >
                      {days[i]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Work hours */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {lang === 'th' ? 'เวลาเริ่ม' : 'Start Time'}
                </label>
                <select
                  value={draft.work_start}
                  onChange={e => setDraft(p => ({ ...p, work_start: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background text-foreground text-sm px-3 py-2"
                >
                  {TIME_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {lang === 'th' ? 'เวลาสิ้นสุด' : 'End Time'}
                </label>
                <select
                  value={draft.work_end}
                  onChange={e => setDraft(p => ({ ...p, work_end: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background text-foreground text-sm px-3 py-2"
                >
                  {TIME_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* View mode summary */}
        {!editing && therapist.work_start && therapist.work_end && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{therapist.work_start} – {therapist.work_end}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminTherapistSchedule() {
  const { lang } = useLang();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: therapists = [], isLoading } = useQuery({
    queryKey: ['therapists-all'],
    queryFn: () => base44.entities.Therapist.list('name_th', 50),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Therapist.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapists-all'] });
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
      toast({ title: lang === 'th' ? 'บันทึกตารางงานแล้ว' : 'Schedule saved' });
    },
    onError: () => {
      toast({ title: lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Failed to save', variant: 'destructive' });
    },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground flex items-center gap-2">
          <Users className="w-7 h-7 text-primary" />
          {lang === 'th' ? 'ตารางงานเทอราปิส' : 'Therapist Schedules'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === 'th' ? 'กำหนดวันและเวลาทำงานของเทอราปิสแต่ละคน' : 'Set working days and hours for each therapist'}
        </p>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm py-8 text-center">
          {lang === 'th' ? 'กำลังโหลด...' : 'Loading...'}
        </div>
      ) : therapists.length === 0 ? (
        <div className="text-muted-foreground text-sm py-8 text-center">
          {lang === 'th' ? 'ยังไม่มีเทอราปิส' : 'No therapists found'}
        </div>
      ) : (
        <div className="space-y-3">
          {therapists.map(therapist => (
            <TherapistRow
              key={therapist.id}
              therapist={therapist}
              lang={lang}
              onSave={(id, data) => updateMutation.mutate({ id, data })}
            />
          ))}
        </div>
      )}
    </div>
  );
}