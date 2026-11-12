import { create } from 'zustand';

export type MovementTypeFilter = 'todos' | 'ingresos' | 'gastos';
export type MovementPeriodFilter = 'mes' | 'anio';
export type MovementSort = 'recientes' | 'antiguos' | 'monto';

export interface MovementFilter {
  tipo: MovementTypeFilter;
  /** 'year'-scoped todos los movimientos del año seleccionado cuando es "anio". */
  period: MovementPeriodFilter;
  categoryId: string | null;
  paymentMethod: string | null;
  sort: MovementSort;
}

export const DEFAULT_MOVEMENT_FILTER: MovementFilter = {
  tipo: 'todos',
  period: 'mes',
  categoryId: null,
  paymentMethod: null,
  sort: 'recientes',
};

interface MovementFilterStore extends MovementFilter {
  setFilter: (patch: Partial<MovementFilter>) => void;
  resetFilter: () => void;
}

/**
 * Filtros de la pantalla Movimientos (mock "Filtros"). No se persisten: viven
 * en memoria para el ciclo de la sesión y se aplican al volver a Actividad.
 */
export const useMovementFilterStore = create<MovementFilterStore>()((set) => ({
  ...DEFAULT_MOVEMENT_FILTER,
  setFilter: (patch) => set((state) => ({ ...state, ...patch })),
  resetFilter: () => set({ ...DEFAULT_MOVEMENT_FILTER }),
}));
