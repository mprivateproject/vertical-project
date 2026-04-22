import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminClient } from '@/lib/adminClient';
import { useLang } from '@/lib/LanguageContext';
import { format } from 'date-fns';
import { Search, UserCheck, UserX, Users, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function AdminInvitedMembers() {
  const { lang } = useLang();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('invited'); // 'invited' | 'regular'

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => adminClient.getCustomers(),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_invited_member }) =>
      adminClient.updateCustomer(id, {
        is_invited_member,
        invited_at: is_invited_member ? format(new Date(), 'yyyy-MM-dd') : null,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-customers'] }),
  });

  const invited = customers.filter(c => c.is_invited_member);
  const regular = customers.filter(c => !c.is_invited_member);

  const filtered = (tab === 'invited' ? invited : regular).filter(c =>
    !search ||
    c.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            {lang === 'th' ? 'Invited Members' : 'Invited Members'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {lang === 'th' ? `${invited.length} สมาชิกที่ได้รับเชิญ จาก ${customers.length} ลูกค้าทั้งหมด` : `${invited.length} invited of ${customers.length} total`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <Star className="w-3.5 h-3.5" />
          {invited.length}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
        {[
          { key: 'invited', label: lang === 'th' ? `Invited (${invited.length})` : `Invited (${invited.length})` },
          { key: 'regular', label: lang === 'th' ? `ลูกค้าทั่วไป (${regular.length})` : `Regular (${regular.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหาลูกค้า..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {tab === 'invited'
              ? (lang === 'th' ? 'ยังไม่มี Invited Members' : 'No invited members yet')
              : (lang === 'th' ? 'ไม่พบลูกค้า' : 'No customers found')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((customer, i) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={customer.picture_url || `https://ui-avatars.com/api/?name=${customer.display_name}&background=random&size=48`}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-foreground truncate">{customer.display_name}</p>
                        {customer.is_invited_member && (
                          <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">
                            ✦ Invited
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {customer.total_visits || 0} visits
                        {customer.invited_at && ` · Invited ${format(new Date(customer.invited_at), 'dd MMM yyyy')}`}
                      </p>
                    </div>

                    {/* Toggle button */}
                    <button
                      onClick={() => toggleMutation.mutate({
                        id: customer.id,
                        is_invited_member: !customer.is_invited_member,
                      })}
                      disabled={toggleMutation.isPending}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                        customer.is_invited_member
                          ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                          : 'bg-primary/10 text-primary hover:bg-primary/20'
                      }`}
                    >
                      {customer.is_invited_member ? (
                        <><UserX className="w-3.5 h-3.5" /> {lang === 'th' ? 'ถอด' : 'Remove'}</>
                      ) : (
                        <><UserCheck className="w-3.5 h-3.5" /> {lang === 'th' ? 'เชิญ' : 'Invite'}</>
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}