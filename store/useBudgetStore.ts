import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_BUDGET_LIMITS } from '@/constants/finance';

export interface CategoryLimit {
  /** Monto máximo asignado a la categoría en el mes (ARS). */
  amount: number;
  /** Avisar cuando se llega al 80% del límite. */
  notify80: boolean;
}

export interface BudgetStore {
  /** Límites explícitos por mes: monthKey -> categoryId -> límite. */
  limitsByMonth: Record<string, Record<string, CategoryLimit>>;

  setMonthLimit: (monthKey: string, categoryId: string, limit: CategoryLimit) => void;
  removeMonthLimit: (monthKey: string, categoryId: string) => void;
}

export const BUDGET_STORAGE_KEY = 'gastos-budget-v1';

/**
 * Límites efectivos de un mes: los defaults estáticos de la identidad ADG
 * (Alimentación $300.000, Hogar $350.000, Transporte $120.000,
 * Ocio $130.000, Otros $100.000) pisados por las personalizaciones
 * guardadas del mes.
 */
export function resolveMonthLimits(
  limitsByMonth: Record<string, Record<string, CategoryLimit>>,
  monthKey: string,
): Record<string, CategoryLimit> {
  const overrides = limitsByMonth[monthKey];
  const merged: Record<string, CategoryLimit> = {};
  for (const [categoryId, amount] of Object.entries(DEFAULT_BUDGET_LIMITS)) {
    merged[categoryId] = { amount, notify80: true };
  }
  if (overrides) {
    for (const [categoryId, limit] of Object.entries(overrides)) {
      if (Number.isFinite(limit?.amount) && limit.amount >= 0) {
        merged[categoryId] = { amount: limit.amount, notify80: limit.notify80 !== false };
      }
    }
  }
  return merged;
}

export function totalMonthLimit(limits: Record<string, CategoryLimit>): number {
  return Object.values(limits).reduce((sum, limit) => sum + Math.max(0, limit.amount), 0);
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set) => ({
      limitsByMonth: {},

      setMonthLimit: (monthKey, categoryId, limit) =>
        set((state) => ({
          limitsByMonth: {
            ...state.limitsByMonth,
            [monthKey]: {
              ...state.limitsByMonth[monthKey],
              [categoryId]: {
                amount: limit.amount,
                notify80: limit.notify80 !== false,
              },
            },
          },
        })),

      removeMonthLimit: (monthKey, categoryId) =>
        set((state) => {
          const month = { ...state.limitsByMonth[monthKey] };
          delete month[categoryId];
          const next = { ...state.limitsByMonth };
          if (Object.keys(month).length === 0) {
            delete next[monthKey];
          } else {
            next[monthKey] = month;
          }
          return { limitsByMonth: next };
        }),
    }),
    {
      name: BUDGET_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: (state) => ({ limitsByMonth: state.limitsByMonth }),
    },
  ),
);
