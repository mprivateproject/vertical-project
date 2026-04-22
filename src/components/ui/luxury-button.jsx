import React from 'react';
import { cn } from '@/lib/utils';

const LuxuryButton = React.forwardRef(
  ({ className, variant = 'primary', disabled = false, children, ...props }, ref) => {
    const baseStyles = 'h-11 px-6 rounded-xl font-semibold text-sm tracking-wide transition-all duration-180 ease-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-gradient-to-r from-[#a855f7] to-[#3b82f6] text-white hover:shadow-glow-purple',
      secondary: 'glass-surface border border-blue-400/20 text-text-primary hover:glass-surface/80',
      ghost: 'text-text-secondary hover:text-text-primary',
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