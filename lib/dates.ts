const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string | null | undefined): value is string {
  return !!value && ISO_DATE.test(value);
}

/** Fecha de hoy en formato YYYY-MM-DD según la zona horaria local. */
export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formatea la fecha de un documento para mostrarla ("4 de noviembre de 2026").
 * Los documentos antiguos guardaban la fecha como texto libre: se devuelve tal cual.
 */
export function formatDocDate(value: string | null | undefined): string {
  if (!value) return '';
  if (!isIsoDate(value)) return value;
  const [y, m, d] = value.split('-').map(Number);
  // Se usa mediodía UTC para que la zona horaria no mueva el día.
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}
