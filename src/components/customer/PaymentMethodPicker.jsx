import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import { QrCode, Building2, Wallet, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';

const methods = [
  { key: 'promptpay', icon: QrCode, recommended: true, color: 'text-blue-600' },
  { key: 'rabbit_line_pay', icon: Wallet, color: 'text-green-600' },
  { key: 'truemoney', icon: Wallet, color: 'text-orange-500' },
  { key: 'bank_transfer', icon: Building2, color: 'text-purple-600' },
  { key: 'cash', icon: Banknote, color: 'text-emerald-600' },
];

export default function PaymentMethodPicker({ selected, onSelect }) {
  const { t } = useLang();

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">{t('paymentMethod')}</h3>
      <div className="space-y-2">
        {methods.map(({ key, icon: Icon, recommended, color }, i) => {
          const isSelected = selected === key;
          return (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(key)}
              className={`flex items-center gap-3 w-full p-3.5 rounded-xl border transition-all active:scale-[0.98] ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              }`}
            >
              <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-secondary'}`}>
                <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : color}`} />
              </div>
              <span className="text-sm font-medium text-foreground flex-1 text-left">
                {t(key)}
              </span>
              {recommended && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                  แนะนำ
                </span>
              )}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                isSelected ? 'border-primary' : 'border-muted-foreground/30'
              }`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}