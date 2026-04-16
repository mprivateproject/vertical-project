import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function MobileHeader({ title, subtitle, onBack }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <div
      className="flex items-center gap-3 px-5 pb-4 bg-background"
      style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
    >
      <button
        onClick={handleBack}
        className="flex items-center justify-center w-9 h-9 rounded-xl bg-secondary hover:bg-accent transition-colors shrink-0"
      >
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="font-semibold text-foreground text-base leading-tight truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}