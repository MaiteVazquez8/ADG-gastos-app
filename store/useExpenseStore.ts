import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Expense, NewExpense } from '@/types';
import { getMonthKey } from '@/utils/date';
import { generateId } from '@/utils/id';
import { MAX_AMOUNT } from '@/utils/currency';

export interface ExpenseStore {
  expenses: Expense[];
  addExpense: (input: NewExpense) => Expense;
  updateExpense: (id: string, input: NewExpense) => void;
  deleteExpense: (id: string) => void;
  clearAllExpenses: () => void;
  /** Reassigns every expense of one category to another (used before deleting a category). */
  moveExpensesByCategory: (from: string, to: string) => void;
  getExpensesByMonth: (monthKey: string) => Expense[];
  getExpensesByCategory: (category: string) => Expense[];
}

export const STORAGE_KEY = 'gastos-expenses-v1';

function isUsableAmount(amount: unknown): amount is number {
  return (
    typeof amount === 'number' &&
    Number.isFinite(amount) &&
    amount > 0 &&
    amount <= MAX_AMOUNT
  );
}

interface PersistedExpenseState {
  expenses?: Expense[];
}

/** Drops corrupted amounts (NaN) that older versions could persist. */
function migrateExpenseState(state: PersistedExpenseState): PersistedExpenseState {
  return {
    ...state,
    expenses: (state.expenses ?? []).filter((expense) => isUsableAmount(expense.amount)),
  };
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      expenses: [],

      addExpense: (input) => {
        const expense: Expense = {
          ...input,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        if (isUsableAmount(expense.amount)) {
          set((state) => ({ expenses: [...state.expenses, expense] }));
        }
        return expense;
      },

      updateExpense: (id, input) => {
        if (!isUsableAmount(input.amount)) {
          return;
        }
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id ? { ...expense, ...input, id } : expense,
          ),
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({ expenses: state.expenses.filter((expense) => expense.id !== id) }));
      },

      clearAllExpenses: () => set({ expenses: [] }),

      moveExpensesByCategory: (from, to) => {
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.category === from ? { ...expense, category: to } : expense,
          ),
        }));
      },

      getExpensesByMonth: (monthKey) => get().expenses.filter((e) => getMonthKey(e.date) === monthKey),

      getExpensesByCategory: (category) =>
        get().expenses.filter((e) => e.category === category),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState) => migrateExpenseState(persistedState as PersistedExpenseState),
      partialize: (state) => ({ expenses: state.expenses }),
    },
  ),
);