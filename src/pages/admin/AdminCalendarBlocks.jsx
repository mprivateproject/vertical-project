import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/LanguageContext';
import { format, isBefore, startOfDay, isSameDay, eachDayOfInterval, startOfMonth, endOfMonth, getDay, addMonths, subMonths } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { Lock, LockOpen, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function AdminCalendarBlocks() {
  const { lang } = useLang();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const locale = lang === 'th' ? th : enUS;

  const [calMonth, setCalMonth] = useState(new Date());
  const [reason, setReason] = useState('');

  const today = startOfDay(new Date());

  const { data: blocks = [] } = useQuery({
    queryKey: ['calendar-blocks'],
    queryFn: () => base44.entities.CalendarBlock.list('-block_date', 200),
  });

  const blockedDates = useMemo(() => new Set(blocks.map(b => b.block_date)), [blocks]);

  const createBlock = useMutation({
    mutationFn: (block_date) =>
      base44.entities.CalendarBlock.create({ block_date, reason: reason.trim() || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-blocks'] });
      toast({ title: lang === 'th' ? 'ล็อควันที่แล้ว' : 'Date blocked' });
      setReason('');
    },
  });

  const deleteBlock = useMutation({
    mutationFn: (id) => base44.entities.CalendarBlock.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-blocks'] });
      toast({ title: lang === 'th' ? 'ปลดล็อควันที่แล้ว' : 'Date unblocked' });
    },
  });

  function handleDayClick(day) {
    const ds = format(day, 'yyyy-MM-dd');
    if (blockedDates.has(ds)) {
      const block = blocks.find(b => b.block_date === ds);
      if (block) deleteBlock.mutate(block.id);
    } else {
      createBlock.mutate(ds);
    }
  }

  const monthDays = eachDayOfInterval({
    start: startOfMonth(calMonth),
    end: endOfMonth(calMonth),
  });
  const startPad = getDay(startOfMonth(calMonth));

  // Upcoming blocks sorted
  const upcomingBlocks = blocks
    .filter(b => !isBefore(new Date(b.block_date + 'T00:00:00'), today))
    .sort((a, b) => a.block_date.localeCompare(b.block_date));

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground flex items-center gap-2">
          <Lock className="w-7 h-7 text-primary" />
          {lang === 'th' ? 'ล็อคปฏิทิน' : 'Calendar Blocks'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === 'th'
            ? 'คลิกวันที่เพื่อล็อค (ปิดรับจอง) หรือคลิกอีกครั้งเพื่อปลดล็อค'
            : 'Click a date to block it (disable bookings), click again to unblock'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Calendar */}
        <Card className="border-border/50 h-fit">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCalMonth(m => subMonths(m, 1))}
                className="p-1.5 rounded-lg hover:bg-secondary"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <CardTitle className="text-base">
                {format(calMonth, 'MMMM yyyy', { locale }).toUpperCase()}
              </CardTitle>
              <button
                onClick={() => setCalMonth(m => addMonths(m, 1))}
                className="p-1.5 rounded-lg hover:bg-secondary"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            {/* Reason input */}
            <div className="mb-3">
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder={lang === 'th' ? 'เหตุผล (ไม่บังคับ)' : 'Reason (optional)'}
                className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {(lang === 'th' ? ['อา','จ','อ','พ','พฤ','ศ','ส'] : ['Su','Mo','Tu','We','Th','Fr','Sa']).map(d => (
                <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-1">{d}</div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
              {monthDays.map(day => {
                const ds = format(day, 'yyyy-MM-dd');
                const isPast = isBefore(day, today);
                const isBlocked = blockedDates.has(ds);
                const isCurrentDay = isSameDay(day, today);

                return (
                  <button
                    key={ds}
                    onClick={() => !isPast && handleDayClick(day)}
                    disabled={isPast}
                    className={`
                      mx-auto w-9 h-9 rounded-full text-sm font-medium transition-all flex items-center justify-center
                      ${isPast ? 'text-muted-foreground/30 cursor-not-allowed' : 'cursor-pointer'}
                      ${isBlocked && !isPast ? 'bg-destructive/15 border border-destructive/40 text-destructive font-bold' : ''}
                      ${!isBlocked && !isPast ? 'hover:bg-secondary' : ''}
                      ${isCurrentDay && !isBlocked ? 'ring-2 ring-primary/40' : ''}
                      ${isCurrentDay && isBlocked ? 'ring-2 ring-destructive/50' : ''}
                    `}
                  >
                    {isBlocked && !isPast ? (
                      <span className="relative">
                        {format(day, 'd')}
                        <Lock className="absolute -top-1.5 -right-2 w-2.5 h-2.5 text-destructive" />
                      </span>
                    ) : (
                      format(day, 'd')
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-destructive/15 border border-destructive/40" />
                <span>{lang === 'th' ? 'ล็อคแล้ว' : 'Blocked'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full ring-2 ring-primary/40" />
                <span>{lang === 'th' ? 'วันนี้' : 'Today'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming blocks list */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-destructive" />
              {lang === 'th' ? `วันที่ถูกล็อค (${upcomingBlocks.length})` : `Blocked Dates (${upcomingBlocks.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBlocks.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <LockOpen className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {lang === 'th' ? 'ยังไม่มีวันที่ถูกล็อค' : 'No upcoming blocked dates'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {upcomingBlocks.map(block => {
                  const dateObj = new Date(block.block_date + 'T00:00:00');
                  return (
                    <div
                      key={block.id}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-destructive/5 border border-destructive/20"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {format(dateObj, 'd MMMM yyyy', { locale })}
                        </p>
                        {block.reason && (
                          <p className="text-xs text-muted-foreground mt-0.5">{block.reason}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteBlock.mutate(block.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive/70 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}