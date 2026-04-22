import React from 'react';
import { cn } from '@/lib/utils';

const LuxuryButton = React.forwardRef(
  ({ className, variant = 'primary', disabled = false, children, ...props }, ref) => {
    const baseStyles = 'h-14 px-6 rounded-lg font-semibold text-sm tracking-wide transition-all duration-180 ease-out active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-gradient-to-r from-[#C6A87D] to-[#B8966B] text-[#0B0F14] hover:brightness-110',
      secondary: 'bg-glass-surface border border-glass-border text-text-primary hover:bg-opacity-[0.08]',
      ghost: 'text-text-secondary hover:text-text-primary transparent',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

LuxuryButton.displayName = 'LuxuryButton';

export default LuxuryButton;