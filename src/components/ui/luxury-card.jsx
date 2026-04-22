import React from 'react';
import { cn } from '@/lib/utils';

const LuxuryCard = React.forwardRef(
  ({ className, variant = 'default', isSelectable = false, isSelected = false, onClick, children, ...props }, ref) => {
    const baseStyles = 'bg-glass-surface border border-glass-border backdrop-blur-[24px] rounded-xl p-6 shadow-soft transition-all duration-180 ease-out';

    const variants = {
      default: '',
      selectable: isSelectable ? 'cursor-pointer hover:-translate-y-0.5 hover:bg-opacity-[0.06]' : '',
      elevated: 'shadow-lg',
    };

    const selectedStyles = isSelected && isSelectable ? 'border-[#C6A87D] shadow-glow scale-[1.01]' : '';

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], selectedStyles, className)}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);

LuxuryCard.displayName = 'LuxuryCard';

export default LuxuryCard;