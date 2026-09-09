import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { monthKeyOf } from '@/utils/date';

interface MonthStore {
  monthKey: string;
  setMonthKey: (monthKey: string) => void;
}

export const useMonthStore = create<MonthStore>()(
  persist(
    (set) => ({
      monthKey: monthKeyOf(new Date()),
      setMonthKey: (monthKey) => set({ monthKey }),
    }),
    {
      name: 'gastos-month-v1',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);