import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface SettingsStore {
  /** Transiciones y gráficos animados (mock: Motion). */
  motion: boolean;
  /** Ver el balance al abrir ADG (mock: Resumen mensual). */
  monthlySummary: boolean;
  /** Avisar al llegar al 80% del presupuesto (mock: Alertas de presupuesto). */
  budgetAlerts: boolean;
  /** Recordatorios diarios para registrar gastos (mock: Recordatorios). */
  reminders: boolean;
  /** True una vez que se sembraron los datos de demostración (o se omitieron por datos existentes). */
  demoSeeded: boolean;

  setMotion: (value: boolean) => void;
  setMonthlySummary: (value: boolean) => void;
  setBudgetAlerts: (value: boolean) => void;
  setReminders: (value: boolean) => void;
  setDemoSeeded: (value: boolean) => void;
}

export const SETTINGS_STORAGE_KEY = 'gastos-settings-v1';

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      motion: true,
      monthlySummary: true,
      budgetAlerts: true,
      reminders: true,
      demoSeeded: false,

      setMotion: (value) => set({ motion: value }),
      setMonthlySummary: (value) => set({ monthlySummary: value }),
      setBudgetAlerts: (value) => set({ budgetAlerts: value }),
      setReminders: (value) => set({ reminders: value }),
      setDemoSeeded: (value) => set({ demoSeeded: value }),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: (state) => ({
        motion: state.motion,
        monthlySummary: state.monthlySummary,
        budgetAlerts: state.budgetAlerts,
        reminders: state.reminders,
        demoSeeded: state.demoSeeded,
      }),
    },
  ),
);
