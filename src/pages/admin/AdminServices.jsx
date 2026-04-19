import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminClient } from '@/lib/adminClient';
import { useLang } from '@/lib/LanguageContext';
import { Plus, Pencil, Trash2, Clock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';

const CATEGORIES = ['massage', 'facial', 'body_treatment', 'package', 'wellness'];

export default function AdminServices() {
  const { t, lang } = useLang();
  const queryClient = useQueryClient();
  const [editService, setEditService] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => adminClient.getServices(),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => adminClient.saveService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      setDialogOpen(false);
      setEditService(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminClient.deleteService(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-services'] }),
  });

  const handleOpenNew = () => {
    setEditService({
      name_th: '', name_en: '', description_th: '', description_en: '',
      category: 'massage', duration_minutes: 60, price: 0,
      image_url: '', is_popular: false, is_active: true, sort_order: 0,
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">{t('services')}</h1>
        <Button onClick={handleOpenNew} className="rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> {t('add')}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-3">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {service.image_url && (
                      <img src={service.image_url} alt="" className="w-14 h-14 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm text-foreground truncate">
                          {lang === 'th' ? service.name_th : service.name_en}
                        </h3>
                        {!service.is_active && (
                          <EyeOff className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px]">{t(service.category)}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {service.duration_minutes} {t('minutes')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-primary">฿{service.price?.toLocaleString()}</p>
                      <div className="flex gap-1 mt-1">
                        <button
                          onClick={() => { setEditService(service); setDialogOpen(true); }}
                          className="p-1.5 rounded-md hover:bg-secondary"
                        >
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(service.id)}
                          className="p-1.5 rounded-md hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
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
            <DialogTitle>{editService?.id ? t('edit') : t('add')} {t('service')}</DialogTitle>
          </DialogHeader>
          {editService && (
            <ServiceForm
              service={editService}
              onSave={(data) => saveMutation.mutate(data)}
              isSaving={saveMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ServiceForm({ service, onSave, isSaving }) {
  const { t } = useLang();
  const [form, setForm] = useState(service);

  const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }));

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
        <Label className="text-xs">รายละเอียด (TH)</Label>
        <Textarea value={form.description_th} onChange={e => updateField('description_th', e.target.value)} className="mt-1" rows={2} />
      </div>
      <div>
        <Label className="text-xs">Description (EN)</Label>
        <Textarea value={form.description_en} onChange={e => updateField('description_en', e.target.value)} className="mt-1" rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">{t('duration')} ({t('minutes')})</Label>
          <Input type="number" value={form.duration_minutes} onChange={e => updateField('duration_minutes', parseInt(e.target.value))} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">ราคา (฿)</Label>
          <Input type="number" value={form.price} onChange={e => updateField('price', parseInt(e.target.value))} className="mt-1" />
        </div>
      </div>
      <div>
        <Label className="text-xs">หมวดหมู่</Label>
        <Select value={form.category} onValueChange={v => updateField('category', v)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{t(c)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Image URL</Label>
        <Input value={form.image_url || ''} onChange={e => updateField('image_url', e.target.value)} className="mt-1" />
      </div>
      <Button onClick={() => onSave(form)} disabled={isSaving} className="w-full">
        {t('save')}
      </Button>
    </div>
  );
}