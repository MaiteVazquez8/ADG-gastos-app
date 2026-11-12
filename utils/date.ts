const MONTHS_FULL = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

const MONTHS_SHORT = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
] as const;

const WEEKDAYS_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'] as const;

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Formats a YYYY-MM-DD string (e.g. "2026-09-07") using local calendar time. */
export function fromISODate(iso: string): Date {
  const match = ISO_DATE_PATTERN.exec(iso);
  if (!match) {
    return new Date(NaN);
  }
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidISODate(iso: string): boolean {
  const parsed = fromISODate(iso);
  return !Number.isNaN(parsed.getTime()) && toISODate(parsed) === iso;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function getMonthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function monthKeyOf(date: Date): string {
  return toISODate(date).slice(0, 7);
}

/** Returns the first day of the month for a YYYY-MM key. */
export function monthKeyStartDate(monthKey: string): Date {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

/** Returns the ISO date of the first day of a YYYY-MM key, e.g. "2026-10-01". */
export function monthKeyStartISO(monthKey: string): string {
  return toISODate(monthKeyStartDate(monthKey));
}

/**
 * Default date for a new expense/income opened while the user is working on a
 * specific month: the 1st of that month when it is not the current one (so the
 * record lands in the month being viewed), today otherwise. Any date can still
 * be changed afterwards.
 */
export function defaultDateForMonth(monthKey: string): string {
  const first = monthKeyStartISO(monthKey);
  if (monthKey !== monthKeyOf(new Date()) && isValidISODate(first)) {
    return first;
  }
  return todayISO();
}

export function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function formatISODate(iso: string): string {
  const date = fromISODate(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatISODateShort(iso: string): string {
  const date = fromISODate(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

export function formatISODateLong(iso: string): string {
  const date = fromISODate(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return `${WEEKDAYS_SHORT[date.getDay()]}, ${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

/** "10 de noviembre de 2026" — formato largo usado en los campos del mock. */
export function formatISODateFullEs(iso: string): string {
  const date = fromISODate(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return `${date.getDate()} de ${MONTHS_FULL[date.getMonth()].toLowerCase()} de ${date.getFullYear()}`;
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  if (Number.isNaN(year) || Number.isNaN(month)) {
    return monthKey;
  }
  return `${MONTHS_FULL[month - 1]} ${year}`;
}

export function formatMonthLabelShort(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  if (Number.isNaN(year) || Number.isNaN(month)) {
    return monthKey;
  }
  return `${MONTHS_SHORT[month - 1]} ${year}`;
}

/** Returns just the short month name, e.g. "sep". */
export function formatMonthKeyTiny(monthKey: string): string {
  const [, month] = monthKey.split('-').map(Number);
  if (Number.isNaN(month) || month < 1 || month > 12) {
    return monthKey;
  }
  return MONTHS_SHORT[month - 1];
}

export function formatDayLabel(date: number): string {
  return WEEKDAYS_SHORT[date];
}

export function isSameMonthKey(a: string, b: string): boolean {
  return getMonthKey(a) === getMonthKey(b);
}

/** Human friendly label for the header, e.g. "Hoy", "Ayer", "lun, 7 sep". */
export function formatRelativeDay(iso: string): string {
  const today = todayISO();
  if (iso === today) {
    return 'Hoy';
  }
  const yDate = new Date();
  yDate.setDate(yDate.getDate() - 1);
  if (iso === toISODate(yDate)) {
    return 'Ayer';
  }
  return formatISODateShort(iso);
}