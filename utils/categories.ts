import type { FinanceCategory, IconName } from '@/types';

export const UNCATEGORIZED: FinanceCategory = {
  id: '__sin-categoria__',
  name: 'Sin categoría',
  icon: 'help-circle-outline' as IconName,
  color: '#64748B',
  createdAt: '',
};

export function findCategory(
  categories: readonly FinanceCategory[],
  id: string,
): FinanceCategory | undefined {
  return categories.find((category) => category.id === id);
}

/** Resolves a category id to its metadata, falling back to "Sin categoría". */
export function resolveCategory(
  categories: readonly FinanceCategory[],
  id: string,
): FinanceCategory {
  return findCategory(categories, id) ?? UNCATEGORIZED;
}

export function countExpensesByCategory(
  expenses: readonly { category: string }[],
  categoryId: string,
): number {
  return expenses.reduce((count, expense) => (expense.category === categoryId ? count + 1 : count), 0);
}