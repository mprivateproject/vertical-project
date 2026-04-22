import React from 'react';
import { cn } from '@/lib/utils';

const LuxuryInput = React.forwardRef(
  ({ className, placeholder, ...props }, ref) => {
    return (
      <input
        ref={ref}
        placeholder={placeholder}
        className={cn(
          'w-full bg-glass-surface border border-glass-border backdrop-blur-[24px] rounded-md px-4 py-3.5 text-text-primary placeholder-text-secondary/50',
          'transition-all duration-180 ease-out',
          'focus:outline-none focus:border-[#C6A87D] focus:shadow-glow',
          className
        )}
        {...props}
      />
    );
  }
);

LuxuryInput.displayName = 'LuxuryInput';

export default LuxuryInput;