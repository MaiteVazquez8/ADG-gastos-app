import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { buildDemoExpenses, buildDemoIncomes } from '@/constants/demo-data';

/**
 * Carga los datos de demostración de ADG una sola vez y solo cuando no hay
 * datos propios. Si la app reinstala o los storages están vacíos, el usuario
 * ve el recorrido completo del mock (noviembre 2026 con sus movimientos,
 * presupuestos al 68% y la comparación octubre/noviembre).
 *
 * Nunca pisa datos existentes: con un solo gasto o ingreso persistido no se
 * siembra nada.
 */
export function seedDemoDataIfNeeded(): void {
  const settings = useSettingsStore.getState();
  if (settings.demoSeeded) {
    return;
  }

  const hasExpenses = useExpenseStore.getState().expenses.length > 0;
  const hasIncomes = useFinanceStore.getState().incomes.length > 0;

  if (hasExpenses || hasIncomes) {
    settings.setDemoSeeded(true);
    return;
  }

  useExpenseStore.setState({ expenses: buildDemoExpenses() });
  useFinanceStore.setState({ incomes: buildDemoIncomes() });
  settings.setDemoSeeded(true);
}
