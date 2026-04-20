import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminClient } from '@/lib/adminClient';
import { useLang } from '@/lib/LanguageContext';
import { Plus, Pencil, Trash2, Badge as BadgeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';

const TIER_KEYS = ['none', 'silver', 'gold', 'platinum'];

export default function AdminLoyalty() {
  const { t, lang } = useLang();
  const queryClient = useQueryClient();
  const [editTier, setEditTier] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: tiers = [], isLoading } = useQuery({
    queryKey: ['admin-loyalty-tiers'],
    queryFn: () => adminClient.getLoyaltyTiers(),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => adminClient.saveLoyaltyTier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loyalty-tiers'] });
      setDialogOpen(false);
      setEditTier(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminClient.deleteLoyaltyTier(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-loyalty-tiers'] }),
  });

  const handleOpenNew = () => {
    setEditTier({
      name_th: '',
      name_en: '',
      tier_key: 'none',
      min_points: 0,
      benefits_th: [],
      benefits_en: [],
      discount_percentage: 0,
      points_multiplier: 1,
      is_active: true,
      sort_order: 0,
    });
    setDialogOpen(true);
  };

  const TIER_COLORS = {
    none: 'bg-gray-100 text-gray-700',
    silver: 'bg-slate-200 text-slate-800',
    gold: 'bg-amber-100 text-amber-800',
    platinum: 'bg-zinc-100 text-zinc-800',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          {lang === 'th' ? 'ระบบ Loyalty' : 'Loyalty Program'}
        </h1>
        <Button onClick={handleOpenNew} className="rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> {t('add')}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-3">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-foreground">
                          {lang === 'th' ? tier.name_th : tier.name_en}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${TIER_COLORS[tier.tier_key]}`}>
                          {tier.tier_key}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>📍 {lang === 'th' ? 'ต้อง' : 'Requires'} {tier.min_points} {lang === 'th' ? 'แต้ม' : 'pts'}</span>
                        {tier.discount_percentage > 0 && (
                          <span>💰 {tier.discount_percentage}% {lang === 'th' ? 'ส่วนลด' : 'discount'}</span>
                        )}
                        {tier.points_multiplier > 1 && (
                          <span>🔥 {(tier.points_multiplier * 100).toFixed(0)}% {lang === 'th' ? 'แต้ม' : 'pts'}</span>
                        )}
                      </div>
                      {((lang === 'th' ? tier.benefits_th : tier.benefits_en) || []).slice(0, 2).map((b, j) => (
                        <p key={j} className="text-xs text-muted-foreground">• {b}</p>
                      ))}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => { setEditTier(tier); setDialogOpen(true); }}
                        className="p-1.5 rounded-md hover:bg-secondary"
                      >
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(tier.id)}
                        className="p-1.5 rounded-md hover:bg-destructive/10"
                      >
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

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTier?.id ? t('edit') : t('add')} Loyalty Tier</DialogTitle>
          </DialogHeader>
          {editTier && (
            <TierForm
              tier={editTier}
              onSave={(data) => saveMutation.mutate(data)}
              isSaving={saveMutation.isPending}
              lang={lang}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TierForm({ tier, onSave, isSaving, lang }) {
  const [form, setForm] = useState(tier);

  const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const updateBenefits = (lang_key, value) => 
    updateField(lang_key, value.split('\n').filter(b => b.trim()));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">ชื่อ (TH)</Label>
          <Input value={form.name_th} onChange={e => updateField('name_th', e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">Name (EN)</Label>
          <Input value={form.name_en} onChange={e => updateField('name_en', e.target.value)} className="mt-1" />
        </div>
      </div>
      
      <div>
        <Label className="text-xs">Tier Key</Label>
        <select
          value={form.tier_key}
          onChange={e => updateField('tier_key', e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
        >
          {['none', 'silver', 'gold', 'platinum'].map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Min Points</Label>
          <Input type="number" value={form.min_points} onChange={e => updateField('min_points', parseInt(e.target.value))} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">Discount %</Label>
          <Input type="number" step="0.1" value={form.discount_percentage} onChange={e => updateField('discount_percentage', parseFloat(e.target.value))} className="mt-1" />
        </div>
      </div>

      <div>
        <Label className="text-xs">Points Multiplier</Label>
        <Input type="number" step="0.1" value={form.points_multiplier} onChange={e => updateField('points_multiplier', parseFloat(e.target.value))} className="mt-1" />
      </div>

      <div>
        <Label className="text-xs">สิทธิประโยชน์ (TH)</Label>
        <Textarea 
          value={(form.benefits_th || []).join('\n')} 
          onChange={e => updateBenefits('benefits_th', e.target.value)} 
          className="mt-1" 
          rows={3}
          placeholder="หนึ่งสิทธิต่อบรรทัด"
        />
      </div>

      <div>
        <Label className="text-xs">Benefits (EN)</Label>
        <Textarea 
          value={(form.benefits_en || []).join('\n')} 
          onChange={e => updateBenefits('benefits_en', e.target.value)} 
          className="mt-1" 
          rows={3}
          placeholder="One benefit per line"
        />
      </div>

      <Button onClick={() => onSave(form)} disabled={isSaving} className="w-full">
        Save
      </Button>
    </div>
  );
}