const CURRENCY_SYMBOL = '$';

/** Upper bound for a single amount (≈$100M), enough for any real income. */
export const MAX_AMOUNT = 99_999_999.99;

/** 0.5 -> 0.5 so values like 0.30000000000000004 never leak to the UI. */
export function toCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function groupThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Formats a monetary value using the Spanish convention (e.g. $1.500.000,00)
 * without relying on Intl (Hermes ICU data is inconsistent across platforms).
 */
export function formatCurrency(amount: number): string {
  const cents = toCents(amount);
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const fixed = abs.toFixed(2).replace('.', ',');
  const [intPart, decimalPart] = fixed.split(',');
  return `${sign}${CURRENCY_SYMBOL}${groupThousands(intPart)},${decimalPart}`;
}

/** Formatea con el símbolo solo, sin decimales: "$570.000". */
export function formatArs(amount: number): string {
  const cents = toCents(amount);
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const intPart = Math.floor(abs).toString();
  return `${sign}${CURRENCY_SYMBOL}${groupThousands(intPart)}`;
}

/** "$ 570.000" como se muestra en el mock: símbolo, espacio y miles con punto. */
export function formatArsSpaced(amount: number): string {
  return formatArs(amount).replace('$', '$ ');
}

/** Movimiento con signo: "+ $ 150.000" / "− $ 42.500" (signo U+2212). */
export function formatSignedArs(signedAmount: number): string {
  const sign = signedAmount >= 0 ? '+' : '−';
  return `${sign} $ ${groupThousands(Math.floor(Math.abs(toCents(signedAmount))).toString())}`;
}

/** Porcentaje en formato es-AR: "35,3%". */
export function formatPercentEs(value: number, decimals = 1): string {
  return `${value.toFixed(decimals).replace('.', ',')}%`;
}

/** Entero en formato es-AR: "1.120" (compacto, para ejes de gráficos). */
export function formatThousandsOnly(value: number): string {
  return groupThousands(Math.round(Math.abs(value)).toString());
}

/** Compact value for chart axes, e.g. 1,2k / 3,5m. */
export function formatCompactCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  const format = (value: number) => value.toFixed(1).replace('.', ',');
  if (abs >= 1_000_000) {
    return `${sign}${CURRENCY_SYMBOL}${format(abs / 1_000_000)}m`;
  }
  if (abs >= 1_000) {
    return `${sign}${CURRENCY_SYMBOL}${format(abs / 1_000)}k`;
  }
  return `${sign}${CURRENCY_SYMBOL}${abs.toFixed(0)}`;
}

/**
 * Normalizes a user-typed amount to a plain decimal string. Accepts Spanish
 * and English separators: "1.500.000", "1.500.000,50", "1234,56", "1234.56".
 */
export function normalizeAmountText(raw: string): string {
  let t = raw.trim();
  if (t === '') {
    return '';
  }
  const hasComma = t.includes(',');
  if (hasComma) {
    // Comma is the decimal separator; dots are thousands separators.
    t = t.replace(/\./g, '');
    t = t.replace(',', '.');
  } else {
    const dots = t.split('.').length - 1;
    if (dots > 1) {
      // "1.500.000" -> thousands separators only.
      t = t.replace(/\./g, '');
    } else if (dots === 1) {
      // Exactly three decimals is almost always the Spanish thousands
      // notation: "1.234" -> 1234 (a decimal like 12,34 would use a comma).
      const [whole, decimals] = t.split('.');
      if (decimals.length === 3) {
        t = whole + decimals;
      }
    }
  }
  return t;
}

/**
 * Parses a free-form monetary string into a positive number with at most two
 * decimal places. Returns null when the input is not a valid amount.
 */
export function parseAmount(raw: string): number | null {
  const normalized = normalizeAmountText(raw);
  if (normalized === '') {
    return null;
  }
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  const cents = toCents(value);
  if (cents > MAX_AMOUNT) {
    return null;
  }
  return cents;
}

/**
 * Sanitizes an amount string while the user is typing. Keeps digits plus one
 * comma and/or dots; limits the length to protect against accidental input.
 */
export function sanitizeAmountInput(raw: string): string {
  let t = raw.replace(/[^0-9.,]/g, '');
  const firstComma = t.indexOf(',');
  if (firstComma !== -1) {
    t = t.slice(0, firstComma + 1) + t.slice(firstComma + 1).replace(/,/g, '');
  }
  return t.slice(0, 14);
}