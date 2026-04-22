import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminClient } from '@/lib/adminClient';
import { useLang } from '@/lib/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
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
};

export default function AdminCustomers() {
  const { t } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editTierId, setEditTierId] = useState(null);

  const updateTierMutation = useMutation({
    mutationFn: ({ id, tier }) => adminClient.updateCustomer(id, { membership_tier: tier }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      setEditTierId(null);
    },
  });

  const editTierCustomer = customers.find(c => c.id === editTierId);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => adminClient.getCustomers(),
  });

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
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-foreground truncate">
                            {customer.display_name}
                          </p>
                          <Badge className={`text-[10px] ${tierColors[customer.membership_tier || 'none']}`}>
                            {customer.membership_tier || 'none'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" />
                            {customer.total_visits || 0} visits
                          </span>
                          <span className="flex items-center gap-0.5">
                            <DollarSign className="w-3 h-3" />
                            ฿{(customer.total_spent || 0).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3" />
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
                    <p className="text-xs text-muted-foreground mt-2 pl-14 italic">
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
              <p className="text-sm text-muted-foreground mb-4">
                <span className="font-medium text-foreground">{editTierCustomer?.display_name}</span>
              </p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {['none', 'silver', 'gold', 'platinum'].map(tier => (
                  <button
                    key={tier}
                    onClick={() => updateTierMutation.mutate({ id: editTierId, tier })}
                    disabled={updateTierMutation.isPending}
                    className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all disabled:opacity-50 capitalize ${
                      editTierCustomer?.membership_tier === tier
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50 text-foreground'
                    } ${tierColors[tier]}`}
                  >
                    {tier === 'none' ? '— none' : tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setEditTierId(null)}
                className="w-full py-2 rounded-lg text-sm border border-border hover:bg-secondary transition-colors"
              >
                ยกเลิก
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