// frontend/src/lib/format.ts
export function formatDate(dateStr: string | Date) {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  return d.toLocaleDateString(undefined, options); // e.g. "12 Dec 2025"
}

export function formatTime(dateStr: string | Date) {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); // e.g. "12:00 AM"
}
