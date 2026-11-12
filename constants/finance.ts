import type { IconName } from '@/types';

export interface CategorySeed {
  id: string;
  name: string;
  icon: IconName;
  color: string;
}

/**
 * Colores de la identidad ADG para categorías: verdes de la marca y neutros.
 * La primera mitad es para gastos, la segunda para ingresos.
 */
export const ADG_CATEGORY_COLORS = [
  '#1DCD9F',
  '#169976',
  '#FFFFFF',
  '#8FE8CB',
  '#5C5C5C',
  '#0F9D76',
  '#B9F5DE',
  '#7D7D7D',
] as const;

/**
 * Default categories seeded on first launch. Ids keep the legacy expense ids
 * (except the new `hogar`) so existing expenses keep working without a data
 * migration. Names/icons follow the ADG mock (Alimentación, Hogar, Transporte,
 * Ocio, Otros + Ahorro, Servicios, Salud, Compras).
 */
export const DEFAULT_CATEGORY_SEEDS: readonly CategorySeed[] = [
  { id: 'food', name: 'Alimentación', icon: 'cart-outline', color: '#1DCD9F' },
  { id: 'hogar', name: 'Hogar', icon: 'home', color: '#169976' },
  { id: 'transport', name: 'Transporte', icon: 'bus', color: '#FFFFFF' },
  { id: 'entertainment', name: 'Ocio', icon: 'gamepad-variant', color: '#8FE8CB' },
  { id: 'other', name: 'Otros', icon: 'tag-outline', color: '#7D7D7D' },
  { id: 'ahorro', name: 'Ahorro', icon: 'piggy-bank-outline', color: '#169976' },
  { id: 'bills', name: 'Servicios', icon: 'receipt-text-outline', color: '#B9F5DE' },
  { id: 'health', name: 'Salud', icon: 'heart-pulse', color: '#0F9D76' },
  { id: 'shopping', name: 'Compras', icon: 'shopping-outline', color: '#FFFFFF' },
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

/**
 * Límites mensuales por defecto (ARS) para el presupuesto por categoría de
 * ADG: Alimentación $300.000, Hogar $350.000, Transporte $120.000,
 * Ocio $130.000, Otros $100.000. Suman $1.000.000 como en el mock.
 * Se usan cuando el mes no tiene límites personalizados.
 */
export const DEFAULT_BUDGET_LIMITS: Readonly<Record<string, number>> = {
  food: 300_000,
  hogar: 350_000,
  transport: 120_000,
  entertainment: 130_000,
  other: 100_000,
} as const;

export interface IncomeSourceMeta {
  id: string;
  label: string;
  icon: IconName;
  /** Descripción corta mostrada en las pantallas de ingresos. */
  description: string;
}

export const INCOME_SOURCES: readonly IncomeSourceMeta[] = [
  { id: 'sueldo', label: 'Sueldo', icon: 'bank-outline', description: 'Trabajo en relación de dependencia' },
  { id: 'freelance', label: 'Freelance', icon: 'laptop', description: 'Proyectos independientes' },
  { id: 'bonificacion', label: 'Bonificación', icon: 'gift-outline', description: 'Bonos y extras del trabajo' },
  { id: 'ventas', label: 'Ventas', icon: 'store-outline', description: 'Ventas de bienes o servicios' },
  { id: 'inversiones', label: 'Inversiones', icon: 'trending-up', description: 'Rendimientos y dividendos' },
  { id: 'otros', label: 'Otros ingresos', icon: 'dots-horizontal-circle-outline', description: 'Regalos, ventas y reintegros' },
] as const;

export type PaymentMethodId =
  | 'efectivo'
  | 'tarjeta-debito'
  | 'tarjeta-credito'
  | 'transferencia'
  | 'debito-automatico';

export interface PaymentMethodMeta {
  id: PaymentMethodId;
  label: string;
  icon: IconName;
}

export const PAYMENT_METHODS: readonly PaymentMethodMeta[] = [
  { id: 'efectivo', label: 'Efectivo', icon: 'cash' },
  { id: 'tarjeta-debito', label: 'Tarjeta de débito', icon: 'credit-card-outline' },
  { id: 'tarjeta-credito', label: 'Tarjeta de crédito', icon: 'credit-card-multiple-outline' },
  { id: 'transferencia', label: 'Transferencia bancaria', icon: 'bank-transfer' },
  { id: 'debito-automatico', label: 'Débito automático', icon: 'reload' },
] as const;

export function paymentMethodLabel(id: string | undefined): string {
  return PAYMENT_METHODS.find((method) => method.id === id)?.label ?? 'Sin especificar';
}

const CATEGORY_COLORS = ADG_CATEGORY_COLORS;

const CATEGORY_ICONS: readonly IconName[] = [
  'cart-outline',
  'home',
  'bus',
  'car',
  'food-apple-outline',
  'gamepad-variant',
  'movie-open-outline',
  'music-note-eighth',
  'school-outline',
  'medical-bag',
  'heart-pulse',
  'piggy-bank-outline',
  'bank-outline',
  'receipt-text-outline',
  'wifi',
  'water-outline',
  'lightbulb-outline',
  'phone-outline',
  'airplane',
  'gift-outline',
  'paw',
  'shopping-outline',
  'hanger',
  'tools',
  'tag-outline',
  'dots-horizontal-circle-outline',
] as const;

export function getCategoryColors(): readonly string[] {
  return CATEGORY_COLORS;
}

export function getCategoryIcons(): readonly IconName[] {
  return CATEGORY_ICONS;
}
