import { cn } from "@/lib/utils"

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "accent"
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-apple",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        {
          "bg-primary text-primary-fg hover:opacity-90 shadow-glow":
            variant === "primary",

          "bg-secondary text-secondary-fg hover:opacity-90":
            variant === "secondary",

          "bg-accent text-accent-fg hover:opacity-90":
            variant === "accent",

          "bg-transparent text-fg hover:bg-muted":
            variant === "ghost",
        },
        className
      )}
      {...props}
    />
  )
}
