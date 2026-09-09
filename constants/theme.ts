import type { ThemeMode } from '@/types';

export interface Palette {
  isDark: boolean;

  background: string;
  backgroundElevated: string;
  card: string;
  cardPressed: string;
  border: string;
  borderStrong: string;

  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  primary: string;
  primaryStrong: string;
  primarySoft: string;
  onPrimary: string;

  danger: string;
  dangerStrong: string;
  dangerSoft: string;

  success: string;
  warning: string;

  overlay: string;
  shadow: string;

  track: string;
}

const PALETTES: Record<'light' | 'dark', Palette> = {
  light: {
    isDark: false,

    background: '#F4F6F9',
    backgroundElevated: '#F4F6F9',
    card: '#FFFFFF',
    cardPressed: '#F0F3F7',
    border: '#E1E6ED',
    borderStrong: '#D5DBE4',

    textPrimary: '#10151D',
    textSecondary: '#5C6472',
    textTertiary: '#7E8899',
    textInverse: '#FFFFFF',

    primary: '#0F9D76',
    primaryStrong: '#0B7D5F',
    primarySoft: '#E2F5EF',
    onPrimary: '#FFFFFF',

    danger: '#E5484D',
    dangerStrong: '#B9363B',
    dangerSoft: '#FDEBEB',

    success: '#12A150',
    warning: '#E08C00',

    overlay: 'rgba(8, 12, 18, 0.5)',
    shadow: '#0B1220',

    track: '#E7EAF0',
  },
  dark: {
    isDark: true,

    background: '#0B0F17',
    backgroundElevated: '#0F151F',
    card: '#141B26',
    cardPressed: '#1F2A3A',
    border: '#273243',
    borderStrong: '#35425A',

    textPrimary: '#F0F3F8',
    textSecondary: '#9AA4B4',
    textTertiary: '#7C8696',
    textInverse: '#0B0F17',

    primary: '#34D399',
    primaryStrong: '#5FE0AE',
    primarySoft: '#122A26',
    onPrimary: '#04130E',

    danger: '#F87171',
    dangerStrong: '#EF4444',
    dangerSoft: '#331518',

    success: '#4ADE80',
    warning: '#FBBF24',

    overlay: 'rgba(0, 0, 0, 0.6)',
    shadow: '#000000',

    track: '#182130',
  },
};

export function resolvePalette(mode: ThemeMode, systemScheme: 'light' | 'dark'): Palette {
  const scheme = mode === 'system' ? systemScheme : mode;
  return PALETTES[scheme];
}