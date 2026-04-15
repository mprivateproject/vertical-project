import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import { Star, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TherapistPicker({ therapists = [], selected, onSelect }) {
  const { t, lang } = useLang();

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">{t('selectTherapist')}</h3>
      
      {/* No preference option */}
      <button
        onClick={() => onSelect(null)}
        className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-all active:scale-[0.98] ${
          selected === null
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
          <UserCircle className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">{t('anyTherapist')}</p>
          <p className="text-xs text-muted-foreground">{t('noPreference')}</p>
        </div>
      </button>

      {/* Therapist list */}
      <div className="grid grid-cols-2 gap-2">
        {therapists.map((therapist, i) => {
          const name = lang === 'th' ? therapist.name_th : therapist.name_en;
          const isSelected = selected?.id === therapist.id;
          
          return (
            <motion.button
              key={therapist.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(therapist)}
              className={`flex flex-col items-center p-3 rounded-xl border transition-all active:scale-[0.98] ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              }`}
            >
              <img
                src={therapist.photo_url || `https://ui-avatars.com/api/?name=${therapist.nickname}&background=random&size=80`}
                alt={name}
                className="w-14 h-14 rounded-full object-cover"
              />
              <p className="text-xs font-medium text-foreground mt-2 truncate w-full text-center">
                {therapist.nickname}
              </p>
              <div className="flex items-center gap-0.5 mt-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-[10px] text-muted-foreground">
                  {therapist.rating?.toFixed(1)}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}