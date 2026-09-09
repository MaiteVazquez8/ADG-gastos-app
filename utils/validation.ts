import type { FinanceCategory } from '@/types';
import { MAX_AMOUNT, formatCurrency, parseAmount } from '@/utils/currency';
import { isValidISODate } from '@/utils/date';

export const MAX_NOTE_LENGTH = 200;
export const MAX_CATEGORY_NAME_LENGTH = 24;

export interface ExpenseFormValues {
  amount: string;
  category: string | null;
  date: string;
  note: string;
}

export interface ExpenseFormErrors {
  amount?: string;
  category?: string;
  date?: string;
}

export function validateExpenseForm(
  values: ExpenseFormValues,
  categories: readonly FinanceCategory[],
): ExpenseFormErrors | null {
  const errors: ExpenseFormErrors = {};

  if (values.amount.trim() === '') {
    errors.amount = 'Ingresá un monto';
  } else if (parseAmount(values.amount) === null) {
    errors.amount = `Ingresá un monto válido de hasta ${formatCurrency(MAX_AMOUNT)}`;
  }

  if (!values.category || !categories.some((category) => category.id === values.category)) {
    errors.category = 'Elegí una categoría';
  }

  if (!isValidISODate(values.date)) {
    errors.date = 'Elegí una fecha válida';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export interface IncomeFormValues {
  amount: string;
  source: string | null;
  date: string;
  note: string;
}

export interface IncomeFormErrors {
  amount?: string;
  source?: string;
  date?: string;
}

export function validateIncomeForm(values: IncomeFormValues): IncomeFormErrors | null {
  const errors: IncomeFormErrors = {};

  if (values.amount.trim() === '') {
    errors.amount = 'Ingresá un monto';
  } else if (parseAmount(values.amount) === null) {
    errors.amount = `Ingresá un monto válido de hasta ${formatCurrency(MAX_AMOUNT)}`;
  }

  if (!values.source) {
    errors.source = 'Elegí una fuente';
  }

  if (!isValidISODate(values.date)) {
    errors.date = 'Elegí una fecha válida';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/** Keeps a percentage input to at most 3 integer digits and 2 decimals. */
export function sanitizePercentageInput(raw: string): string {
  let digits = raw.replace(/[^0-9.]/g, '');
  const firstDot = digits.indexOf('.');
  if (firstDot !== -1) {
    const whole = digits.slice(0, firstDot).slice(0, 3);
    const decimal = digits
      .slice(firstDot + 1)
      .replace(/\./g, '')
      .slice(0, 2);
    digits = `${whole}.${decimal}`;
  } else {
    digits = digits.slice(0, 3);
  }
  return digits;
}

/** Parses a percentage (0-100) rounded to two decimals. Returns null when invalid. */
export function parsePercentageInput(raw: string): number | null {
  const trimmed = (raw ?? '').trim();
  if (trimmed === '') {
    return null;
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    return null;
  }
  return Math.round(value * 100) / 100;
}

export function validateCategoryName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed === '') {
    return 'Ingresá un nombre';
  }
  if (trimmed.length > MAX_CATEGORY_NAME_LENGTH) {
    return `Máximo ${MAX_CATEGORY_NAME_LENGTH} caracteres`;
  }
  return null;
}