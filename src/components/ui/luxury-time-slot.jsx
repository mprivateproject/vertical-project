import React from 'react';
import { cn } from '@/lib/utils';

const LuxuryTimeSlot = React.forwardRef(
  ({ className, isSelected = false, onClick, children, ...props }, ref) => {
    const baseStyles = 'px-3.5 py-2.5 rounded-pill bg-glass-surface border border-glass-border text-sm font-medium transition-all duration-180 ease-out cursor-pointer';

    const defaultState = 'text-text-secondary hover:bg-opacity-[0.08]';
    const selectedState = isSelected
      ? 'bg-gradient-to-r from-[#C6A87D] to-[#B8966B] text-[#0B0F14] scale-[1.03] shadow-glow font-semibold'
      : '';

    return (
      <button
        ref={ref}
        className={cn(baseStyles, !isSelected && defaultState, selectedState, className)}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

LuxuryTimeSlot.displayName = 'LuxuryTimeSlot';

export default LuxuryTimeSlot;