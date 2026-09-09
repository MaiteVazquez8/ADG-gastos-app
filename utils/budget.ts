import type { CategoryDistribution, Expense, FinanceCategory, Income } from '@/types';
import { toCents } from '@/utils/currency';
import { getMonthKey } from '@/utils/date';
import { resolveCategory } from '@/utils/categories';

export type BudgetStatus = 'ok' | 'warning' | 'alert' | 'exceeded';

export interface BudgetCategoryRow {
  categoryId: string;
  name: string;
  icon: FinanceCategory['icon'];
  color: string;
  percentage: number;
  /** Assigned money for the month: income * percentage / 100. */
  budget: number;
  spent: number;
  available: number;
  /** Spent / budget, 0-100 (capped for display; budgeting treats >100 as exceeded). */
  progress: number;
  status: BudgetStatus;
  count: number;
}

export interface MonthSummary {
  incomeTotal: number;
  budgetedTotal: number;
  spentTotal: number;
  /** Ingresos - gastos. */
  available: number;
  spentPercentOfIncome: number;
  remainingPercent: number;
  expenseCount: number;
  topCategory: { id: string; name: string; color: string } | null;
  lowestAvailable: { id: string; name: string; color: string; available: number } | null;
  distributionValid: boolean;
}

const DISTRIBUTION_EPSILON = 1e-6;

/** Rounds a percentage to two decimal places. */
export function roundPercent(value: number): number {
  return Math.round(value * 100) / 100;
}

export function resolveMonthDistribution(
  distributionsByMonth: Record<string, CategoryDistribution[]>,
  defaultDistribution: CategoryDistribution[],
  monthKey: string,
): CategoryDistribution[] {
  return distributionsByMonth[monthKey] ?? defaultDistribution;
}

export function distributionMap(
  distributions: readonly CategoryDistribution[],
): ReadonlyMap<string, number> {
  const map = new Map<string, number>();
  for (const distribution of distributions) {
    map.set(distribution.categoryId, distribution.percentage);
  }
  return map;
}

export function distributionSum(distributions: readonly CategoryDistribution[]): number {
  return roundPercent(distributions.reduce((acc, d) => acc + d.percentage, 0));
}

/**
 * Maps every category to the percentage string shown in the distribution
 * editor, defaulting missing categories to "0". Always returns a value for
 * every category so components never read `undefined` (e.g. when a category
 * is added while the editor is open).
 */
export function distributionEditorValues(
  categories: readonly FinanceCategory[],
  distributions: readonly CategoryDistribution[],
): Record<string, string> {
  const percentageById = distributionMap(distributions);
  const values: Record<string, string> = {};
  for (const category of categories) {
    const percentage = percentageById.get(category.id);
    values[category.id] = percentage === undefined ? '0' : String(percentage);
  }
  return values;
}

export function distributionIsComplete(distributions: readonly CategoryDistribution[]): boolean {
  return Math.abs(distributionSum(distributions) - 100) <= DISTRIBUTION_EPSILON;
}

/**
 * Returns a new distribution that includes a category (possibly new) with the
 * given percentage, scaling the remaining categories proportionally so the
 * total keeps summing to 100. Used when a category is created from the
 * distribution flows, so adding a share never silently breaks the 100% sum.
 * Rounding drift is absorbed by the largest share.
 */
export function addCategoryToDistribution(
  distributions: readonly CategoryDistribution[],
  categoryId: string,
  percentage: number,
): CategoryDistribution[] {
  const normalized = roundPercent(percentage);
  const others = distributions.filter((d) => d.categoryId !== categoryId);
  const othersSum = distributionSum(others);
  let scaled: CategoryDistribution[];
  if (othersSum <= 0) {
    scaled = others.map((d) => ({ ...d, percentage: 0 }));
  } else {
    const factor = (100 - normalized) / othersSum;
    scaled = others.map((d) => ({
      ...d,
      percentage: roundPercent(d.percentage * factor),
    }));
    const scaledSum = roundPercent(scaled.reduce((s, d) => s + d.percentage, 0));
    const target = roundPercent(100 - normalized);
    const drift = roundPercent(target - scaledSum);
    if (Math.abs(drift) > 1e-9) {
      const largestIndex = scaled.reduce((best, d, i) =>
        d.percentage > scaled[best].percentage ? i : best,
        0,
      );
      scaled[largestIndex] = {
        ...scaled[largestIndex],
        percentage: roundPercent(scaled[largestIndex].percentage + drift),
      };
    }
  }
  return [...scaled, { categoryId, percentage: normalized }];
}

export function totalIncomeForMonth(incomes: readonly Income[], monthKey: string): number {
  return toCents(
    incomes
      .filter((income) => getMonthKey(income.date) === monthKey)
      .reduce((sum, income) => sum + income.amount, 0),
  );
}

export function incomesForMonth(incomes: readonly Income[], monthKey: string): Income[] {
  return incomes
    .filter((income) => getMonthKey(income.date) === monthKey)
    .sort((a, b) => {
      const byDate = b.date.localeCompare(a.date);
      if (byDate !== 0) {
        return byDate;
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
}

export function allocatedForCategory(incomeTotal: number, percentage: number): number {
  return toCents((incomeTotal * percentage) / 100);
}

/**
 * Converts a fixed money amount into the percentage it represents of the
 * month's total income (0-100). Returns null when there is no income to base
 * the conversion on, or when the amount exceeds the total income (more than
 * 100% of the month).
 */
export function amountToPercentage(amount: number, incomeTotal: number): number | null {
  const incomeCents = toCents(incomeTotal);
  const amountCents = toCents(amount);
  if (incomeCents <= 0 || amountCents <= 0 || amountCents > incomeCents) {
    return null;
  }
  return roundPercent((amountCents / incomeCents) * 100);
}

export function budgetStatus(spent: number, budget: number): BudgetStatus {
  if (budget <= 0) {
    return spent > 0 ? 'exceeded' : 'ok';
  }
  if (spent > budget) {
    return 'exceeded';
  }
  const ratio = spent / budget;
  if (ratio > 0.9) {
    return 'alert';
  }
  if (ratio >= 0.7) {
    return 'warning';
  }
  return 'ok';
}

export function buildBudgetRows(
  categories: readonly FinanceCategory[],
  distributions: readonly CategoryDistribution[],
  incomeTotal: number,
  monthExpenses: readonly Expense[],
): BudgetCategoryRow[] {
  const percentageById = distributionMap(distributions);
  const spentById = new Map<string, number>();
  const countById = new Map<string, number>();

  for (const expense of monthExpenses) {
    spentById.set(expense.category, (spentById.get(expense.category) ?? 0) + expense.amount);
    countById.set(expense.category, (countById.get(expense.category) ?? 0) + 1);
  }

  return categories.map((category) => {
    const percentage = roundPercent(percentageById.get(category.id) ?? 0);
    const budget = allocatedForCategory(incomeTotal, percentage);
    const spent = toCents(spentById.get(category.id) ?? 0);
    const count = countById.get(category.id) ?? 0;
    const status = budgetStatus(spent, budget);
    const progress = budget <= 0 ? (spent > 0 ? 100 : 0) : toCents((spent / budget) * 100);
    return {
      categoryId: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      percentage,
      budget,
      spent,
      available: toCents(budget - spent),
      progress,
      status,
      count,
    };
  });
}

export function computeMonthSummary(
  categories: readonly FinanceCategory[],
  distributions: readonly CategoryDistribution[],
  incomes: readonly Income[],
  monthExpenses: readonly Expense[],
  monthKey: string,
): MonthSummary {
  const incomeTotal = totalIncomeForMonth(incomes, monthKey);
  const rows = buildBudgetRows(categories, distributions, incomeTotal, monthExpenses);
  const budgetedTotal = toCents(rows.reduce((sum, row) => sum + row.budget, 0));
  const spentTotal = toCents(monthExpenses.reduce((sum, expense) => sum + expense.amount, 0));
  const available = toCents(incomeTotal - spentTotal);
  const spentPercentOfIncome = incomeTotal > 0 ? toCents((spentTotal / incomeTotal) * 100) : 0;
  const remainingPercent = Math.max(roundPercent(100 - spentPercentOfIncome), 0);

  const spentById = new Map<string, number>();
  for (const expense of monthExpenses) {
    spentById.set(expense.category, (spentById.get(expense.category) ?? 0) + expense.amount);
  }

  let topCategory: { id: string; name: string; color: string } | null = null;
  let topSpent = 0;
  for (const [id, spent] of spentById) {
    if (spent > topSpent) {
      topSpent = spent;
      const meta = resolveCategory(categories, id);
      topCategory = { id, name: meta.name, color: meta.color };
    }
  }

  const candidates = rows
    .filter((row) => row.budget > 0 || row.spent > 0)
    .sort((a, b) => a.available - b.available);
  const lowest = candidates[0] ?? null;
  const lowestAvailable =
    lowest ? { id: lowest.categoryId, name: lowest.name, color: lowest.color, available: lowest.available } : null;

  return {
    incomeTotal,
    budgetedTotal,
    spentTotal,
    available,
    spentPercentOfIncome,
    remainingPercent,
    expenseCount: monthExpenses.length,
    topCategory,
    lowestAvailable,
    distributionValid: distributionIsComplete(distributions),
  };
}