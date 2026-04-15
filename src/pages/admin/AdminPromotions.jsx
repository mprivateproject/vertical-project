import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLang } from '@/lib/LanguageContext';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

export default function AdminPromotions() {
  const { t, lang } = useLang();
  const queryClient = useQueryClient();
  const [editPromo, setEditPromo] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: promotions = [] } = useQuery({
    queryKey: ['admin-promotions'],
    queryFn: () => base44.entities.Promotion.list('-created_date', 50),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        const { id, ...rest } = data;
        return base44.entities.Promotion.update(id, rest);
      }
      return base44.entities.Promotion.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Promotion.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-promotions'] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">{t('promotions')}</h1>
        <Button onClick={() => {
          setEditPromo({ title_th: '', title_en: '', description_th: '', description_en: '', discount_type: 'percentage', discount_value: 10, code: '', is_active: true });
          setDialogOpen(true);
        }} className="rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> {t('add')}
        </Button>
      </div>

      <div className="space-y-2">
        {promotions.map((promo, i) => (
          <motion.div key={promo.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Tag className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">
                      {lang === 'th' ? promo.title_th : promo.title_en}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {promo.code && <Badge variant="outline" className="text-[10px]">{promo.code}</Badge>}
                      <Badge className={`text-[10px] ${promo.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {promo.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `฿${promo.discount_value}`} off
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditPromo(promo); setDialogOpen(true); }} className="p-1.5 rounded-md hover:bg-secondary">
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(promo.id)} className="p-1.5 rounded-md hover:bg-destructive/10">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editPromo?.id ? t('edit') : t('add')} {t('promotions')}</DialogTitle>
          </DialogHeader>
          {editPromo && (
            <PromoForm promo={editPromo} onSave={d => saveMutation.mutate(d)} isSaving={saveMutation.isPending} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PromoForm({ promo, onSave, isSaving }) {
  const { t } = useLang();
  const [form, setForm] = useState(promo);
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">ชื่อ (TH)</Label><Input value={form.title_th} onChange={e => up('title_th', e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs">Title (EN)</Label><Input value={form.title_en} onChange={e => up('title_en', e.target.value)} className="mt-1" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Discount Type</Label>
          <Select value={form.discount_type} onValueChange={v => up('discount_type', v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">%</SelectItem>
              <SelectItem value="fixed_amount">฿</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label className="text-xs">Value</Label><Input type="number" value={form.discount_value} onChange={e => up('discount_value', parseInt(e.target.value))} className="mt-1" /></div>
      </div>
      <div><Label className="text-xs">Code</Label><Input value={form.code || ''} onChange={e => up('code', e.target.value)} className="mt-1" /></div>
      <Button onClick={() => onSave(form)} disabled={isSaving} className="w-full">{t('save')}</Button>
    </div>
  );
}