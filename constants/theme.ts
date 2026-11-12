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

/**
 * ADG — Administración Digital de Gastos.
 * Negro como base, verde #1DCD9F para avanzar. Una sola jerarquía en toda la app.
 * Referencia: Mock/02 · Componentes y sistema visual.png
 */
const PALETTES: Record<'light' | 'dark', Palette> = {
  light: {
    isDark: false,

    background: '#F4F4F4',
    backgroundElevated: '#F4F4F4',
    card: '#FFFFFF',
    cardPressed: '#EBEBEB',
    border: '#E2E2E2',
    borderStrong: '#CFCFCF',

    textPrimary: '#000000',
    textSecondary: '#4B4B4B',
    textTertiary: '#767676',
    textInverse: '#FFFFFF',

    primary: '#169976',
    primaryStrong: '#1DCD9F',
    primarySoft: '#E2F8EE',
    onPrimary: '#000000',

    danger: '#D64550',
    dangerStrong: '#B9363B',
    dangerSoft: '#FCEBEC',

    success: '#169976',
    warning: '#B45309',

    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: '#000000',

    track: '#E4E4E4',
  },
  dark: {
    isDark: true,

    background: '#000000',
    backgroundElevated: '#0A0A0A',
    card: '#222222',
    cardPressed: '#2C2C2C',
    border: '#2C2C2C',
    borderStrong: '#3D3D3D',

    textPrimary: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textTertiary: '#7D7D7D',
    textInverse: '#000000',

    primary: '#1DCD9F',
    primaryStrong: '#169976',
    primarySoft: '#0E2B21',
    onPrimary: '#000000',

    danger: '#F87171',
    dangerStrong: '#EF4444',
    dangerSoft: '#331518',

    success: '#1DCD9F',
    warning: '#FBBF24',

    overlay: 'rgba(0, 0, 0, 0.65)',
    shadow: '#000000',

    track: '#1A1A1A',
  },
};

export function resolvePalette(mode: ThemeMode, systemScheme: 'light' | 'dark'): Palette {
  const scheme = mode === 'system' ? systemScheme : mode;
  return PALETTES[scheme];
}
