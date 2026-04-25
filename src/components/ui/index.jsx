// Apple component exports
export { default as AppleButton } from './apple-button';
export { default as AppleCard } from './apple-card';

// Legacy luxury exports (for backward compatibility)
export { default as LuxuryButton } from './luxury-button';
export { default as LuxuryCard } from './luxury-card';
export { default as LuxuryCalendar } from './luxury-calendar';
export { default as LuxuryTimeSlot } from './luxury-time-slot';
export { default as LuxuryBottomNav } from './luxury-bottom-nav';
export { default as LuxuryInput } from './luxury-input';

// Standard UI exports
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
export { Badge } from './badge';
export { Button } from './button';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full rounded-xl bg-input px-4 py-2 text-sm text-fg border border-border focus:ring-2 focus:ring-ring outline-none transition-apple"
      {...props}
    />
  )
}
