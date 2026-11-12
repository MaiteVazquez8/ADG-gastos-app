import type { Expense, FinanceCategory, Income } from '@/types';
import { INCOME_SOURCES, paymentMethodLabel } from '@/constants/finance';
import { resolveCategory } from '@/utils/categories';
import { toCents } from '@/utils/currency';

/**
 * Exportación CSV de movimientos (mock: "Formato CSV"). Se abre con la hoja de
 * compartir nativa; no requiere dependencias extra.
 */

function escapeCell(value: string): string {
  if (/[;"\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatCsvAmount(amount: number): string {
  // Coma decimal es-AR, sin separador de miles (Excel AR lo interpreta bien).
  return toCents(amount).toFixed(2).replace('.', ',');
}

export function buildMovementsCsv(
  expenses: readonly Expense[],
  incomes: readonly Income[],
  categories: readonly FinanceCategory[],
): string {
  const header = ['Fecha', 'Tipo', 'Concepto', 'Categoría', 'Medio de pago', 'Monto (ARS)', 'Nota'];
  const rows: string[][] = [header];

  for (const expense of expenses) {
    const meta = resolveCategory(categories, expense.category);
    rows.push([
      expense.date,
      'Gasto',
      expense.note?.trim() || meta.name,
      meta.name,
      paymentMethodLabel(expense.paymentMethod),
      `-${formatCsvAmount(expense.amount)}`,
      expense.note?.trim() ?? '',
    ]);
  }

  for (const income of incomes) {
    const source = INCOME_SOURCES.find((entry) => entry.id === income.source);
    rows.push([
      income.date,
      'Ingreso',
      income.note?.trim() || source?.label || 'Ingreso',
      source?.label ?? 'Ingreso',
      paymentMethodLabel(income.paymentMethod),
      formatCsvAmount(income.amount),
      income.note?.trim() ?? '',
    ]);
  }

  // Orden cronológico ascendente, como espera un historial contable.
  const body = rows.slice(1).sort((a, b) => a[0].localeCompare(b[0]));

  return [rows[0], ...body].map((row) => row.map(escapeCell).join(';')).join('\r\n');
}
