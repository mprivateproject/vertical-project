import React from 'react';
import { cn } from '@/lib/utils';

const LuxuryInput = React.forwardRef(
  ({ className, placeholder, ...props }, ref) => {
    return (
      <input
        ref={ref}
        placeholder={placeholder}
        className={cn(
          'w-full glass-card px-4 py-3.5 text-text-primary placeholder-text-secondary/50',
          'transition-all duration-180 ease-out',
          'focus:outline-none focus:border-purple-400/50 focus:shadow-glow-purple',
          className
        )}
        {...props}
      />
    );
  }
);

LuxuryInput.displayName = 'LuxuryInput';

export default LuxuryInput;