import type { Expense, FinanceCategory } from '@/types';
import { toCents } from '@/utils/currency';
import { getMonthKey } from '@/utils/date';
import { resolveCategory } from '@/utils/categories';
import { resolveMonthLimits, type BudgetStore } from '@/store/useBudgetStore';

export interface LimitRow {
  categoryId: string;
  name: string;
  icon: FinanceCategory['icon'];
  color: string;
  spent: number;
  count: number;
  /** Límite efectivo del mes (0 = sin límite asignado). */
  limit: number;
  /** spent / limit * 100, 0-100+ (0 cuando no hay límite). */
  percent: number;
  notify80: boolean;
}

/**
 * Filas de "Límites por categoría" (mock Presupuestos): gasto acumulado del
 * mes contra el límite efectivo de cada categoría que tenga límite o gasto.
 */
export function buildLimitRows(
  categories: readonly FinanceCategory[],
  monthExpenses: readonly Expense[],
  limitsByMonth: BudgetStore['limitsByMonth'],
  monthKey: string,
): LimitRow[] {
  const limits = resolveMonthLimits(limitsByMonth, monthKey);
  const spentById = new Map<string, number>();
  const countById = new Map<string, number>();

  for (const expense of monthExpenses) {
    if (getMonthKey(expense.date) !== monthKey) {
      continue;
    }
    spentById.set(expense.category, (spentById.get(expense.category) ?? 0) + expense.amount);
    countById.set(expense.category, (countById.get(expense.category) ?? 0) + 1);
  }

  const rows: LimitRow[] = [];
  const existingIds = new Set(categories.map((category) => category.id));
  const categoryIds = new Set<string>([
    ...Object.keys(limits),
    ...spentById.keys(),
  ]);

  // Instalaciones legacy pueden tener límites por defecto para categorías que
  // ya no existen: se omiten filas sin gasto ni categoría vigente.
  for (const categoryId of [...categoryIds]) {
    if (!existingIds.has(categoryId) && !spentById.has(categoryId)) {
      categoryIds.delete(categoryId);
    }
  }

  for (const categoryId of categoryIds) {
    const spent = toCents(spentById.get(categoryId) ?? 0);
    const count = countById.get(categoryId) ?? 0;
    const limitEntry = limits[categoryId];
    const limit = limitEntry?.amount ?? 0;
    const meta = resolveCategory(categories, categoryId);
    rows.push({
      categoryId,
      name: meta.name,
      icon: meta.icon,
      color: meta.color,
      spent,
      count,
      limit,
      percent: limit > 0 ? toCents((spent / limit) * 100) : 0,
      notify80: limitEntry?.notify80 !== false,
    });
  }

  // Los que tienen límite primero, ordenados como el mock: mayor % gastado.
  return rows.sort((a, b) => {
    if (b.limit !== a.limit) {
      return b.limit - a.limit;
    }
    return b.spent - a.spent;
  });
}

export function monthLimitSummary(
  categories: readonly FinanceCategory[],
  monthExpenses: readonly Expense[],
  limitsByMonth: BudgetStore['limitsByMonth'],
  monthKey: string,
): { spent: number; total: number; percent: number } {
  const limits = resolveMonthLimits(limitsByMonth, monthKey);
  const existingIds = new Set(categories.map((category) => category.id));
  const knownLimits = Object.entries(limits).filter(([categoryId]) => existingIds.has(categoryId));
  const total = toCents(
    knownLimits.reduce((sum, [, limit]) => sum + Math.max(0, limit.amount), 0),
  );
  const spent = toCents(
    monthExpenses
      .filter((expense) => getMonthKey(expense.date) === monthKey)
      .reduce((sum, expense) => sum + expense.amount, 0),
  );
  return {
    spent,
    total,
    percent: total > 0 ? toCents((spent / total) * 100) : 0,
  };
}
