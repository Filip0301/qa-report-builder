const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

/** "hace 5 minutos", "ayer", "12 oct 2026"… */
export function formatRelative(date: string | Date, now: Date = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffSec = Math.round((d.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 45) return 'hace un momento';
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
  if (abs < 86_400) return rtf.format(Math.round(diffSec / 3600), 'hour');
  if (abs < 7 * 86_400) return rtf.format(Math.round(diffSec / 86_400), 'day');
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
