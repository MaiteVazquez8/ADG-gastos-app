import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ThemeMode } from '@/types';

interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      // ADG es una identidad oscura: el fondo general es negro. El usuario
      // puede cambiar a claro desde el toggle o Preferencias.
      mode: 'dark',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'gastos-theme-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);