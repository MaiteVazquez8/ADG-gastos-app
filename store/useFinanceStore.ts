import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_CATEGORY_SEEDS, SEED_DISTRIBUTION } from '@/constants/finance';
import type {
  CategoryDistribution,
  FinanceCategory,
  IconName,
  Income,
  NewIncome,
} from '@/types';
import { generateId } from '@/utils/id';
import { MAX_AMOUNT } from '@/utils/currency';

export interface FinanceStore {
  categories: FinanceCategory[];
  incomes: Income[];
  /** Explicit distributions per month. Months without an entry use the default. */
  distributionsByMonth: Record<string, CategoryDistribution[]>;
  /** "Mi distribución habitual": starting point for months without a custom one. */
  defaultDistribution: CategoryDistribution[];

  addCategory: (input: { name: string; icon: IconName; color: string }) => FinanceCategory;
  updateCategory: (id: string, patch: { name: string; icon: IconName; color: string }) => void;
  deleteCategory: (id: string) => void;

  addIncome: (input: NewIncome) => Income;
  updateIncome: (id: string, input: NewIncome) => void;
  deleteIncome: (id: string) => void;

  setMonthDistributions: (monthKey: string, distributions: CategoryDistribution[]) => void;
  setDefaultDistribution: (distributions: CategoryDistribution[]) => void;
  resetDefaultDistribution: () => void;
}

export const FINANCE_STORAGE_KEY = 'gastos-finance-v1';

function seededCategories(): FinanceCategory[] {
  return DEFAULT_CATEGORY_SEEDS.map((seed) => ({
    ...seed,
    createdAt: new Date(0).toISOString(),
  }));
}

function isUsableAmount(amount: unknown): amount is number {
  return (
    typeof amount === 'number' &&
    Number.isFinite(amount) &&
    amount > 0 &&
    amount <= MAX_AMOUNT
  );
}

interface PersistedFinanceState {
  categories?: FinanceCategory[];
  incomes?: Income[];
  distributionsByMonth?: Record<string, CategoryDistribution[]>;
  defaultDistribution?: CategoryDistribution[];
}

/** Drops corrupted amounts (NaN) that older versions could persist. */
function migrateFinanceState(state: PersistedFinanceState): PersistedFinanceState {
  return {
    ...state,
    incomes: (state.incomes ?? []).filter((income) => isUsableAmount(income.amount)),
  };
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      categories: seededCategories(),
      incomes: [],
      distributionsByMonth: {},
      defaultDistribution: SEED_DISTRIBUTION.map((d) => ({ ...d })),

      addCategory: (input) => {
        const category: FinanceCategory = {
          ...input,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ categories: [...state.categories, category] }));
        return category;
      },

      updateCategory: (id, patch) =>
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, ...patch, id } : category,
          ),
        })),

      deleteCategory: (id) =>
        set((state) => {
          const distributionsByMonth: Record<string, CategoryDistribution[]> = {};
          for (const [monthKey, distributions] of Object.entries(state.distributionsByMonth)) {
            distributionsByMonth[monthKey] = distributions.filter((d) => d.categoryId !== id);
          }
          return {
            categories: state.categories.filter((category) => category.id !== id),
            defaultDistribution: state.defaultDistribution.filter((d) => d.categoryId !== id),
            distributionsByMonth,
          };
        }),

      addIncome: (input) => {
        const income: Income = {
          ...input,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        if (isUsableAmount(income.amount)) {
          set((state) => ({ incomes: [...state.incomes, income] }));
        }
        return income;
      },

      updateIncome: (id, input) => {
        if (!isUsableAmount(input.amount)) {
          return;
        }
        set((state) => ({
          incomes: state.incomes.map((income) =>
            income.id === id ? { ...income, ...input, id } : income,
          ),
        }));
      },

      deleteIncome: (id) =>
        set((state) => ({ incomes: state.incomes.filter((income) => income.id !== id) })),

      setMonthDistributions: (monthKey, distributions) =>
        set((state) => ({
          distributionsByMonth: {
            ...state.distributionsByMonth,
            [monthKey]: distributions,
          },
        })),

      setDefaultDistribution: (distributions) => set({ defaultDistribution: distributions }),

      resetDefaultDistribution: () =>
        set((state) => ({
          // Only restore percentages for categories that still exist, so a
          // deleted category never comes back as a dangling entry that skews
          // the 100% sum of an already-scaled distribution.
          defaultDistribution: SEED_DISTRIBUTION.filter((d) =>
            state.categories.some((category) => category.id === d.categoryId),
          ).map((d) => ({ ...d })),
        })),
    }),
    {
      name: FINANCE_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState) => migrateFinanceState(persistedState as PersistedFinanceState),
      partialize: (state) => ({
        categories: state.categories,
        incomes: state.incomes,
        distributionsByMonth: state.distributionsByMonth,
        defaultDistribution: state.defaultDistribution,
      }),
    },
  ),
);