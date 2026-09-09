import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { resolvePalette, type Palette } from '@/constants/theme';
import { useThemeStore } from '@/store/useThemeStore';

interface ThemeContextValue {
  palette: Palette;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const colorScheme = useColorScheme();
  const systemScheme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light';
  const mode = useThemeStore((state) => state.mode);

  const palette = useMemo(() => resolvePalette(mode, systemScheme), [mode, systemScheme]);
  const value = useMemo<ThemeContextValue>(
    () => ({ palette, isDark: palette.isDark }),
    [palette],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}