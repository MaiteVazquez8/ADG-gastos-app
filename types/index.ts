import type { ComponentProps } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface Expense {
  id: string;
  amount: number;
  /** Id of a FinanceCategory. May reference a category that no longer exists. */
  category: string;
  note?: string;
  /** Local calendar date in YYYY-MM-DD format. */
  date: string;
  /** ISO timestamp of when the expense was created. */
  createdAt: string;
}

export type NewExpense = Omit<Expense, 'id' | 'createdAt'>;

export interface FinanceCategory {
  id: string;
  name: string;
  icon: IconName;
  /** Brand color used across badges, charts and selection states. */
  color: string;
  createdAt: string;
}

export interface Income {
  id: string;
  amount: number;
  /** Source id from INCOME_SOURCES. */
  source: string;
  /** Local calendar date in YYYY-MM-DD format. */
  date: string;
  note?: string;
  /** ISO timestamp of when the income was created. */
  createdAt: string;
}

export type NewIncome = Omit<Income, 'id' | 'createdAt'>;

export interface CategoryDistribution {
  categoryId: string;
  /** Percentage of the month total income, 0-100. */
  percentage: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';