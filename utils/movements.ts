import type { Expense, FinanceCategory, Income } from '@/types';
import { INCOME_SOURCES } from '@/constants/finance';
import { resolveCategory } from '@/utils/categories';
import { getMonthKey } from '@/utils/date';

/**
 * Modelo unificado de movimientos (gastos + ingresos) para las pantallas de
 * Movimientos, Últimos movimientos, Historial y exportación CSV.
 */
export interface Movement {
  id: string;
  kind: 'gasto' | 'ingreso';
  /** Monto con signo: negativo para gastos, positivo para ingresos. */
  signedAmount: number;
  absoluteAmount: number;
  /** Concepto mostrado como título (nota, o nombre de categoría como fallback). */
  title: string;
  /** Etiqueta secundaria: nombre de categoría o fuente de ingreso. */
  subtitle: string;
  /** Para ícono/color: categoría de gastos o fuente de ingresos. */
  icon: string;
  color: string;
  /** Id de categoría para gastos (para filtros/navegación). */
  categoryId?: string;
  /** Id de fuente para ingresos. */
  sourceId?: string;
  paymentMethod?: string;
  /** YYYY-MM-DD */
  date: string;
  createdAt: string;
  note?: string;
}

export function buildMovements(
  expenses: readonly Expense[],
  incomes: readonly Income[],
  categories: readonly FinanceCategory[],
): Movement[] {
  const movements: Movement[] = [];

  for (const expense of expenses) {
    const meta = resolveCategory(categories, expense.category);
    const title = expense.note?.trim() ? expense.note.trim() : meta.name;
    movements.push({
      id: expense.id,
      kind: 'gasto',
      signedAmount: -Math.abs(expense.amount),
      absoluteAmount: expense.amount,
      title,
      subtitle: meta.name,
      icon: meta.icon,
      color: meta.color,
      categoryId: expense.category,
      paymentMethod: expense.paymentMethod,
      date: expense.date,
      createdAt: expense.createdAt,
      note: expense.note,
    });
  }

  for (const income of incomes) {
    const source = INCOME_SOURCES.find((entry) => entry.id === income.source);
    const title = income.note?.trim() ? income.note.trim() : source?.label ?? 'Ingreso';
    movements.push({
      id: income.id,
      kind: 'ingreso',
      signedAmount: Math.abs(income.amount),
      absoluteAmount: income.amount,
      title,
      subtitle: source?.label ?? 'Ingreso',
      icon: source?.icon ?? 'bank-outline',
      // Los ingresos se muestran en verde ADG en todos los listados.
      color: '#1DCD9F',
      sourceId: income.source,
      paymentMethod: income.paymentMethod,
      date: income.date,
      createdAt: income.createdAt,
      note: income.note,
    });
  }

  return movements.sort(compareMovementsDesc);
}

export function compareMovementsDesc(a: Movement, b: Movement): number {
  const byDate = b.date.localeCompare(a.date);
  if (byDate !== 0) {
    return byDate;
  }
  return b.createdAt.localeCompare(a.createdAt);
}

export function movementsInMonth(movements: readonly Movement[], monthKey: string): Movement[] {
  return movements.filter((movement) => getMonthKey(movement.date) === monthKey);
}

export function movementsInYear(movements: readonly Movement[], year: number): Movement[] {
  const prefix = String(year);
  return movements.filter((movement) => movement.date.startsWith(prefix));
}

export function movementMatchesQuery(movement: Movement, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === '') {
    return true;
  }
  const haystack = [movement.title, movement.subtitle, movement.note ?? ''].join(' ').toLowerCase();
  return haystack.includes(q);
}

export interface MovementFilterInput {
  tipo: 'todos' | 'ingresos' | 'gastos';
  period: 'mes' | 'anio';
  categoryId: string | null;
  paymentMethod: string | null;
  sort: 'recientes' | 'antiguos' | 'monto';
}

export function filterMovements(
  movements: readonly Movement[],
  monthKey: string,
  filter: MovementFilterInput,
  query = '',
): Movement[] {
  let result = movements.slice();

  if (filter.period === 'mes') {
    result = result.filter((movement) => getMonthKey(movement.date) === monthKey);
  } else {
    const year = monthKey.slice(0, 4);
    result = result.filter((movement) => movement.date.startsWith(year));
  }

  if (filter.tipo === 'gastos') {
    result = result.filter((movement) => movement.kind === 'gasto');
  } else if (filter.tipo === 'ingresos') {
    result = result.filter((movement) => movement.kind === 'ingreso');
  }

  if (filter.categoryId) {
    result = result.filter((movement) => movement.categoryId === filter.categoryId);
  }

  if (filter.paymentMethod) {
    result = result.filter((movement) => movement.paymentMethod === filter.paymentMethod);
  }

  if (query.trim() !== '') {
    result = result.filter((movement) => movementMatchesQuery(movement, query));
  }

  switch (filter.sort) {
    case 'antiguos':
      result.sort((a, b) => compareMovementsDesc(b, a));
      break;
    case 'monto':
      result.sort((a, b) => b.absoluteAmount - a.absoluteAmount);
      break;
    default:
      result.sort(compareMovementsDesc);
  }

  return result;
}
