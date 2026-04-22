import React from 'react';
import { cn } from '@/lib/utils';

const AppleCard = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass-card rounded-lg p-5 transition-apple',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AppleCard.displayName = 'AppleCard';

export default AppleCard;