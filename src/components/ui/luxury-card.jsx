import React from 'react';
import { cn } from '@/lib/utils';

const LuxuryCard = React.forwardRef(
  ({ className, variant = 'default', isSelectable = false, isSelected = false, onClick, children, ...props }, ref) => {
    const baseStyles = 'glass-card rounded-xl p-5 transition-all duration-180 ease-out';

    const variants = {
      default: '',
      selectable: isSelectable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-glow' : '',
      elevated: 'shadow-lg',
    };

    const selectedStyles = isSelected && isSelectable ? 'border-purple-400/30 shadow-glow-purple scale-[1.02]' : '';

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