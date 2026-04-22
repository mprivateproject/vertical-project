import React from 'react';
import { cn } from '@/lib/utils';

const AppleButton = React.forwardRef(
  ({ className, variant = 'primary', size = 'default', disabled = false, children, ...props }, ref) => {
    const baseStyles = 'font-system rounded-lg font-semibold transition-apple active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-primary text-primary-foreground hover:opacity-90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-secondary/40 text-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
    };

    const sizes = {
      default: 'h-11 px-5 text-base',
      lg: 'h-14 px-6 text-lg',
      sm: 'h-9 px-3 text-sm',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

AppleButton.displayName = 'AppleButton';

export default AppleButton;