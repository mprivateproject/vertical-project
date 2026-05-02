/** Normalize "9:00", "09:00:00" -> "09:00" for comparisons */
export function normalizeStartTime(t) {
  if (!t) return '';
  const parts = String(t).split(':');
  const h = Number(parts[0]);
  const m = Number(parts[1] ?? 0);
  if (Number.isNaN(h) || Number.isNaN(m)) return String(t).slice(0, 5);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
