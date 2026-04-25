export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-fg">
      {children}
    </span>
  )
}
