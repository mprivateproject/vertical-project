export function CalendarDay({
  day,
  selected,
}: {
  day: number
  selected?: boolean
}) {
  return (
    <button
      className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center transition-apple",
        selected
          ? "bg-primary text-primary-fg shadow-glow"
          : "text-fg hover:bg-muted"
      )}
    >
      {day}
    </button>
  )
}
