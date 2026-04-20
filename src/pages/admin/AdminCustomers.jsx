import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminClient } from '@/lib/adminClient';
import { useLang } from '@/lib/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Users, Star, DollarSign, Calendar, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const tierColors = {
  none: 'bg-gray-100 text-gray-600',
  silver: 'bg-slate-200 text-slate-700',
  gold: 'bg-amber-100 text-amber-700',
  platinum: 'bg-purple-100 text-purple-700',
};

export default function AdminCustomers() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => adminClient.getCustomers(),
  });

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
              <Card className="border-border/50 hover:border-primary/50 cursor-pointer transition-colors">
                <CardContent className="p-4">
                  <button
                    onClick={() => navigate(`/admin/customers/${customer.id}`)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                    <img
                      src={customer.picture_url || `https://ui-avatars.com/api/?name=${customer.display_name}&background=random&size=48`}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover"
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
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                    </div>
                  </button>
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
    </div>
  );
}