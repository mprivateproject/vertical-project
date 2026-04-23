import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminClient } from '@/lib/adminClient';
import { useLang } from '@/lib/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Star, DollarSign, Calendar, ChevronRight, Trash2, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

const tierColors = {
  none: 'bg-gray-100 text-gray-600',
  silver: 'bg-slate-200 text-slate-700',
  gold: 'bg-amber-100 text-amber-700',
  platinum: 'bg-purple-100 text-purple-700',
  vip: 'bg-rose-100 text-rose-700',
  vvip: 'bg-fuchsia-100 text-fuchsia-700',
};

export default function AdminCustomers() {
  const { t } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editTierId, setEditTierId] = useState(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => adminClient.getCustomers(),
  });

  const { data: loyaltyTiers = [] } = useQuery({
    queryKey: ['loyalty-tiers'],
    queryFn: () => adminClient.getLoyaltyTiers(),
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }) => adminClient.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      setEditTierId(null);
    },
  });

  const editTierCustomer = customers.find(c => c.id === editTierId);

  const deleteMutation = useMutation({
    mutationFn: (id) => adminClient.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      setConfirmDeleteId(null);
    },
  });

  const confirmCustomer = customers.find(c => c.id === confirmDeleteId);

  const filtered = customers.filter(c =>
    !search || c.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">{t('customers')}</h1>
        <Badge variant="secondary">{customers.length} {t('customers')}</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t('search') + '...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">ไม่พบลูกค้า</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((customer, i) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
            >
              <Card className="border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/admin/customers/${customer.id}`)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <img
                        src={customer.picture_url || `https://ui-avatars.com/api/?name=${customer.display_name}&background=random&size=48`}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 flex-wrap">
                         <p className="font-semibold text-base text-foreground truncate">
                           {customer.display_name}
                         </p>
                         {customer.loyalty_tier && customer.loyalty_tier !== 'none' && (
                           <Badge className={`text-[11px] ${tierColors[customer.loyalty_tier] || ''}`}>
                             {customer.loyalty_tier.toUpperCase()}
                           </Badge>
                         )}
                         {customer.is_invited_member && (
                           <Badge className="text-[11px] bg-amber-100 text-amber-700">✦ Invited</Badge>
                         )}
                       </div>
                       <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                         <span className="flex items-center gap-1">
                           <Calendar className="w-3.5 h-3.5" />
                           {customer.total_visits || 0} visits
                         </span>
                         <span className="flex items-center gap-1">
                           <DollarSign className="w-3.5 h-3.5" />
                           ฿{(customer.total_spent || 0).toLocaleString()}
                         </span>
                         <span className="flex items-center gap-1">
                           <Star className="w-3.5 h-3.5" />
                           {customer.loyalty_points || 0} pts
                         </span>
                       </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </button>
                    <button
                      onClick={() => setEditTierId(customer.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-amber-600 hover:bg-amber-50 transition-colors flex-shrink-0"
                      title="แก้ไข tier"
                    >
                      <Crown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(customer.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {customer.notes && (
                    <p className="text-sm text-muted-foreground mt-2 pl-14 italic">
                      {customer.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Tier Dialog */}
      <AnimatePresence>
        {editTierId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={() => setEditTierId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-semibold text-lg mb-1">แก้ไข Tier</h3>
              <p className="text-sm text-muted-foreground mb-5">
                <span className="font-medium text-foreground">{editTierCustomer?.display_name}</span>
              </p>

              {/* Loyalty Tier */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Loyalty Tier</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {loyaltyTiers.map(tier => {
                  const isSelected = editTierCustomer?.loyalty_tier === tier.tier_key;
                  const colorClass = tierColors[tier.tier_key] || 'bg-gray-100 text-gray-600';
                  return (
                    <button
                      key={tier.tier_key}
                      onClick={() => updateCustomerMutation.mutate({ id: editTierId, data: { loyalty_tier: tier.tier_key } })}
                      disabled={updateCustomerMutation.isPending}
                      className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all disabled:opacity-50 ${
                        isSelected ? `border-primary ${colorClass}` : 'border-border hover:border-primary/40 text-foreground'
                      }`}
                    >
                      {tier.name_th}
                    </button>
                  );
                })}
                {loyaltyTiers.length === 0 && (
                  <p className="col-span-3 text-sm text-muted-foreground text-center py-2">ยังไม่มี Tier — ตั้งค่าใน Admin &gt; Loyalty</p>
                )}
              </div>

              {/* Invited Member */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Invited Member</p>
              <div className="flex gap-3 mb-5">
                <button
                  onClick={() => updateCustomerMutation.mutate({ id: editTierId, data: { is_invited_member: true } })}
                  disabled={updateCustomerMutation.isPending}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all disabled:opacity-50 ${
                    editTierCustomer?.is_invited_member
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : 'border-border hover:border-amber-300 text-foreground'
                  }`}
                >
                  ✦ Invited
                </button>
                <button
                  onClick={() => updateCustomerMutation.mutate({ id: editTierId, data: { is_invited_member: false } })}
                  disabled={updateCustomerMutation.isPending}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all disabled:opacity-50 ${
                    !editTierCustomer?.is_invited_member
                      ? 'border-gray-400 bg-gray-100 text-gray-700'
                      : 'border-border hover:border-gray-300 text-foreground'
                  }`}
                >
                  — ปกติ
                </button>
              </div>

              <button
                onClick={() => setEditTierId(null)}
                className="w-full py-2 rounded-lg text-sm border border-border hover:bg-secondary transition-colors"
              >
                ปิด
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <h3 className="font-semibold text-lg mb-1">ลบลูกค้า?</h3>
              <p className="text-sm text-muted-foreground mb-5">
                ต้องการลบ <span className="font-medium text-foreground">{confirmCustomer?.display_name}</span> ออกจากระบบ? ไม่สามารถกู้คืนได้
              </p>
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