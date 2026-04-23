import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { MessageSquare, Star, Trash2, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_LABELS = {
  general: 'ทั่วไป',
  service: 'บริการ',
  therapist: 'นักบำบัด',
  facility: 'สิ่งอำนวยความสะดวก',
  booking: 'การจอง',
};

const RATING_FILTERS = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: '5 ✦', value: 5 },
  { label: '4 ✦', value: 4 },
  { label: '3 ✦', value: 3 },
  { label: '1-2 ✦', value: 'low' },
];

function StarDisplay({ value }) {
  if (!value) return null;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={`text-sm ${s <= value ? 'text-amber-400' : 'text-muted-foreground/20'}`}>✦</span>
      ))}
    </div>
  );
}

export default function AdminFeedback() {
  const queryClient = useQueryClient();
  const [ratingFilter, setRatingFilter] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ['admin-feedbacks'],
    queryFn: () => base44.entities.Feedback.list('-created_date', 200),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Feedback.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedbacks'] });
      setConfirmDeleteId(null);
    },
  });

  const filtered = feedbacks.filter(f => {
    if (ratingFilter === 'all') return true;
    if (ratingFilter === 'low') return f.rating && f.rating <= 2;
    return f.rating === ratingFilter;
  });

  // Stats
  const avgRating = feedbacks.filter(f => f.rating).reduce((sum, f, _, arr) =>
    sum + f.rating / arr.length, 0
  );
  const withRating = feedbacks.filter(f => f.rating).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          ข้อเสนอแนะลูกค้า
        </h1>
        <Badge variant="secondary">{feedbacks.length} รายการ</Badge>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-primary">{feedbacks.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">ทั้งหมด</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-amber-500">{avgRating ? avgRating.toFixed(1) : '—'}</div>
            <div className="text-xs text-muted-foreground mt-0.5">คะแนนเฉลี่ย</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold">{withRating}</div>
            <div className="text-xs text-muted-foreground mt-0.5">มีคะแนน</div>
          </CardContent>
        </Card>
      </div>

      {/* Rating filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        {RATING_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setRatingFilter(f.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              ratingFilter === f.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">ยังไม่มีข้อเสนอแนะ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((fb, i) => {
            // Parse stability rating from category field (e.g. "stability:4")
            const stabilityMatch = fb.category?.match(/^stability:(\d)$/);
            const stabilityRating = stabilityMatch ? parseInt(stabilityMatch[1]) : null;

            return (
              <motion.div
                key={fb.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="border-border/50">
                  <CardContent className="p-4 space-y-3">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {fb.display_name && (
                            <span className="font-semibold text-sm text-foreground">{fb.display_name}</span>
                          )}
                          {fb.lang && (
                            <Badge variant="outline" className="text-[10px] py-0">{fb.lang.toUpperCase()}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {fb.created_date ? format(new Date(fb.created_date), 'd MMM yyyy · HH:mm', { locale: th }) : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => setConfirmDeleteId(fb.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Ratings */}
                    <div className="flex flex-wrap gap-4">
                      {fb.rating != null && fb.rating > 0 && (
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wide">ความพึงพอใจโดยรวม</p>
                          <StarDisplay value={fb.rating} />
                        </div>
                      )}
                      {stabilityRating != null && stabilityRating > 0 && (
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wide">ความเสถียรของระบบ</p>
                          <StarDisplay value={stabilityRating} />
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <p className="text-sm text-foreground leading-relaxed border-l-2 border-primary/30 pl-3">
                      {fb.message}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={() => setConfirmDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-semibold text-lg mb-2">ลบข้อเสนอแนะ?</h3>
              <p className="text-sm text-muted-foreground mb-5">ไม่สามารถกู้คืนได้</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-secondary transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => deleteMutation.mutate(confirmDeleteId)}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 rounded-lg text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'กำลังลบ...' : 'ลบ'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}