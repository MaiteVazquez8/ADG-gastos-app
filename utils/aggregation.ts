import type { Expense } from '@/types';
import { toCents } from '@/utils/currency';
import {
  addMonths,
  daysInMonth,
  fromISODate,
  getMonthKey,
  monthKeyOf,
  monthKeyStartDate,
  toISODate,
} from '@/utils/date';

export interface CategoryTotal {
  category: string;
  total: number;
  /** Share of the passed expenses, rounded to one decimal, 0-100. */
  percentage: number;
  count: number;
}

export interface DayTotal {
  iso: string;
  total: number;
}

export interface MonthTotal {
  monthKey: string;
  total: number;
}

export interface DayGroup {
  date: string;
  total: number;
  items: Expense[];
}

export function sumTotal(expenses: readonly Expense[]): number {
  return toCents(expenses.reduce((acc, expense) => acc + expense.amount, 0));
}

export function sumByMonth(expenses: readonly Expense[], monthKey: string): number {
  return sumTotal(expenses.filter((expense) => getMonthKey(expense.date) === monthKey));
}

/** Returns totals per category, sorted by total descending, with share percentages. */
export function totalsByCategory(
  expenses: readonly Expense[],
  categories: readonly string[],
): CategoryTotal[] {
  const totals = new Map<string, number>();
  const counts = new Map<string, number>();

  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
    counts.set(expense.category, (counts.get(expense.category) ?? 0) + 1);
  }

  const grandTotal = sumTotal(expenses);

  return categories
    .map((category) => {
      const total = toCents(totals.get(category) ?? 0);
      return {
        category,
        total,
        percentage: grandTotal === 0 ? 0 : toCents((total / grandTotal) * 100),
        count: counts.get(category) ?? 0,
      };
    })
    .filter((entry) => entry.total > 0)
    .sort((a, b) => b.total - a.total);
}

/** Every day of a month with its total, so charts render continuous axes. */
export function dailyTotals(expenses: readonly Expense[], monthKey: string): DayTotal[] {
  const start = monthKeyStartDate(monthKey);
  const days = daysInMonth(start.getFullYear(), start.getMonth());

  const byDay = new Map<string, number>();
  for (const expense of expenses) {
    if (getMonthKey(expense.date) !== monthKey) {
      continue;
    }
    byDay.set(expense.date, (byDay.get(expense.date) ?? 0) + expense.amount);
  }

  const result: DayTotal[] = [];
  for (let day = 1; day <= days; day += 1) {
    const iso = toISODate(new Date(start.getFullYear(), start.getMonth(), day));
    result.push({ iso, total: toCents(byDay.get(iso) ?? 0) });
  }
  return result;
}

/** Totals for the last `count` months (including the current one), zero filled. */
export function trailingMonthlyTotals(
  expenses: readonly Expense[],
  count: number,
  now: Date = new Date(),
): MonthTotal[] {
  const months: MonthTotal[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const monthKey = monthKeyOf(addMonths(now, -i));
    months.push({ monthKey, total: sumByMonth(expenses, monthKey) });
  }
  return months;
}

/**
 * Percentage change from `previous` to `current`. Returns null when there is
 * no meaningful baseline (previous is missing or zero).
 */
export function percentDifference(
  current: number,
  previous: number | null | undefined,
): number | null {
  if (previous == null || previous === 0) {
    return null;
  }
  return toCents(((current - previous) / Math.abs(previous)) * 100);
}

/** Groups expenses by day, sorted by most recent first. */
export function groupByDay(expenses: readonly Expense[]): DayGroup[] {
  const groups = new Map<string, Expense[]>();
  for (const expense of expenses) {
    const list = groups.get(expense.date);
    if (list) {
      list.push(expense);
    } else {
      groups.set(expense.date, [expense]);
    }
  }

  return [...groups.entries()]
    .map(([date, items]) => ({
      date,
      total: sumTotal(items),
      items: items.sort((a, b) => fromISODate(b.date).getTime() - fromISODate(a.date).getTime()),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function sortExpensesByDateDesc<T extends Expense>(expenses: readonly T[]): T[] {
  return [...expenses].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) {
      return byDate;
    }
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function filterByMonth(expenses: readonly Expense[], monthKey: string): Expense[] {
  return expenses.filter((expense) => getMonthKey(expense.date) === monthKey);
}

export function filterByCategory(
  expenses: readonly Expense[],
  category: string | null,
): Expense[] {
  return category ? expenses.filter((expense) => expense.category === category) : [...expenses];
}

export function filterByNote(expenses: readonly Expense[], query: string): Expense[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed === '') {
    return [...expenses];
  }
  return expenses.filter((expense) => (expense.note ?? '').toLowerCase().includes(trimmed));
}