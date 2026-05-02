import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminClient } from '@/lib/adminClient';
import { useLang } from '@/lib/LanguageContext';
import { normalizeStartTime } from '@/lib/time-slot-utils';
import { format } from 'date-fns';
import { CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const START_HOUR = 9;
const END_HOUR = 21;

function getAdminTimeSlots() {
  const slots = [];
  for (let h = START_HOUR; h <= END_HOUR; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < END_HOUR) slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
}

const ADMIN_TIME_SLOTS = getAdminTimeSlots();

export default function AdminAvailability() {
  const { t } = useLang();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const slotDateKey = format(selectedDate, 'yyyy-MM-dd');

  const { data: rows = [], isFetching } = useQuery({
    queryKey: ['admin-availability', slotDateKey],
    queryFn: () => adminClient.getAvailabilitySlotsByDate(slotDateKey),
  });

  const [draft, setDraft] = useState(() => new Set());

  useEffect(() => {
    const active = rows
      .filter((r) => r.is_active !== false)
      .map((r) => normalizeStartTime(r.start_time));
    setDraft(new Set(active));
  }, [rows, slotDateKey]);

  const saveMutation = useMutation({
    mutationFn: (startTimes) => adminClient.replaceAvailabilityForDate(slotDateKey, startTimes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-availability', slotDateKey] });
      toast({ title: t('availabilitySaved') });
    },
    onError: (err) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err?.message || String(err),
      });
    },
  });

  const dirty = useMemo(() => {
    const fromRows = new Set(
      rows.filter((r) => r.is_active !== false).map((r) => normalizeStartTime(r.start_time)),
    );
    if (fromRows.size !== draft.size) return true;
    for (const x of draft) {
      if (!fromRows.has(x)) return true;
    }
    return false;
  }, [rows, draft]);

  function toggle(slot) {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(slot)) next.delete(slot);
      else next.add(slot);
      return next;
    });
  }

  function selectAll() {
    setDraft(new Set(ADMIN_TIME_SLOTS));
  }

  function clearAll() {
    setDraft(new Set());
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground flex items-center gap-2">
          <CalendarClock className="w-7 h-7 text-primary" />
          {t('availability')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('availabilityHint')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="border-border/50 h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('selectDate')}</CardTitle>
            <CardDescription>{slotDateKey}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-2">
            <div>
              <CardTitle className="text-base">{t('availableSlots')}</CardTitle>
              <CardDescription className="mt-1">{t('availabilityToggleHint')}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                {t('availabilitySelectAll')}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={clearAll}>
                {t('availabilityClearAll')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isFetching && (
              <p className="text-xs text-muted-foreground">{t('availabilityLoading')}</p>
            )}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {ADMIN_TIME_SLOTS.map((slot) => {
                const on = draft.has(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => toggle(slot)}
                    className={cn(
                      'rounded-lg py-2 text-xs font-medium border transition-colors',
                      on
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted',
                    )}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end pt-2">
              <Button
                disabled={!dirty || saveMutation.isPending}
                onClick={() => saveMutation.mutate([...draft])}
              >
                {saveMutation.isPending ? '…' : t('save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
