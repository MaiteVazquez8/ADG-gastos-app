import type { IconName } from '@/types';

export interface CategorySeed {
  id: string;
  name: string;
  icon: IconName;
  color: string;
}

/**
 * Default categories seeded on first launch. Ids keep the legacy expense ids
 * (except the new `ahorro`) so existing expenses keep working without a data
 * migration.
 */
export const DEFAULT_CATEGORY_SEEDS: readonly CategorySeed[] = [
  { id: 'ahorro', name: 'Ahorro', icon: 'piggy-bank-outline', color: '#6366F1' },
  { id: 'bills', name: 'Servicios', icon: 'receipt-text-outline', color: '#F59E0B' },
  { id: 'food', name: 'Comida', icon: 'food-apple-outline', color: '#F97316' },
  { id: 'transport', name: 'Transporte', icon: 'car', color: '#3B82F6' },
  { id: 'shopping', name: 'Compras', icon: 'shopping-outline', color: '#A855F7' },
  { id: 'entertainment', name: 'Ocio', icon: 'movie-open-outline', color: '#EC4899' },
  { id: 'health', name: 'Salud', icon: 'heart-pulse', color: '#10B981' },
  { id: 'other', name: 'Otros', icon: 'dots-horizontal-circle-outline', color: '#94A3B8' },
] as const;

/** Default percentage distribution shown until a month is customized. */
export const SEED_DISTRIBUTION: readonly { categoryId: string; percentage: number }[] = [
  { categoryId: 'ahorro', percentage: 10 },
  { categoryId: 'bills', percentage: 40 },
  { categoryId: 'food', percentage: 20 },
  { categoryId: 'transport', percentage: 10 },
  { categoryId: 'entertainment', percentage: 10 },
  { categoryId: 'other', percentage: 10 },
  { categoryId: 'shopping', percentage: 0 },
  { categoryId: 'health', percentage: 0 },
] as const;

export interface IncomeSourceMeta {
  id: string;
  label: string;
  icon: IconName;
}

export const INCOME_SOURCES: readonly IncomeSourceMeta[] = [
  { id: 'sueldo', label: 'Sueldo', icon: 'briefcase-outline' },
  { id: 'freelance', label: 'Freelance', icon: 'laptop' },
  { id: 'bonificacion', label: 'Bonificación', icon: 'gift-outline' },
  { id: 'ventas', label: 'Ventas', icon: 'store-outline' },
  { id: 'inversiones', label: 'Inversiones', icon: 'trending-up' },
  { id: 'otros', label: 'Otros', icon: 'dots-horizontal-circle-outline' },
] as const;

const CATEGORY_COLORS = [
  '#F97316',
  '#3B82F6',
  '#A855F7',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#6366F1',
  '#EF4444',
  '#14B8A6',
  '#64748B',
] as const;

const CATEGORY_ICONS: readonly IconName[] = [
  'food-apple-outline',
  'cart-outline',
  'car',
  'bus',
  'school-outline',
  'home-outline',
  'hanger',
  'gift-outline',
  'medical-bag',
  'heart-pulse',
  'gamepad-variant',
  'movie-open-outline',
  'music-note-eighth',
  'airplane',
  'briefcase-outline',
  'receipt-text-outline',
  'piggy-bank-outline',
  'tools',
  'phone-outline',
  'wifi',
  'water-outline',
  'lightbulb-outline',
  'film',
  'paw',
  'shopping-outline',
  'dots-horizontal-circle-outline',
] as const;

export function getCategoryColors(): readonly string[] {
  return CATEGORY_COLORS;
}

export function getCategoryIcons(): readonly IconName[] {
  return CATEGORY_ICONS;
}