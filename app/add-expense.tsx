import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { ExpenseForm } from '@/components/ExpenseForm';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/components/ThemeProvider';
import type { NewExpense } from '@/types';
import { useExpenseStore } from '@/store/useExpenseStore';
import { defaultDateForMonth, todayISO } from '@/utils/date';

export default function AddExpenseScreen() {
  const router = useRouter();
  const { id, month } = useLocalSearchParams<{ id?: string; month?: string }>();
  const { palette } = useAppTheme();

  const expenses = useExpenseStore((state) => state.expenses);
  const addExpense = useExpenseStore((state) => state.addExpense);
  const updateExpense = useExpenseStore((state) => state.updateExpense);

  const isEdit = typeof id === 'string' && id.length > 0;
  const existing = useMemo(
    () => (isEdit ? expenses.find((expense) => expense.id === id) : undefined),
    [expenses, id, isEdit],
  );

  const handleSubmit = (input: NewExpense) => {
    if (isEdit && existing) {
      updateExpense(existing.id, input);
    } else {
      addExpense(input);
    }
    router.back();
  };

  if (isEdit && !existing) {
    return (
      <Screen scroll>
        <Header title="Editar gasto" showBack />
        <EmptyState
          icon="help-circle-outline"
          title="Gasto no encontrado"
          message="El gasto que querés editar ya no existe."
          action={
            <Button label="Volver" variant="secondary" onPress={() => router.back()} />
          }
        />
      </Screen>
    );
  }

  return (
    <Screen scroll keyboardAware>
      <Header
        title={isEdit ? 'Editar gasto' : 'Nuevo gasto'}
        showBack
        right={
          <PressableScale
            onPress={() => router.push('/history')}
            pressedOpacity={0.5}
            accessibilityRole="button"
            accessibilityLabel="Ver historial"
            hitSlop={8}
          >
            <Ionicons name="time-outline" size={22} color={palette.textSecondary} />
          </PressableScale>
        }
      />
      <ExpenseForm
        initialExpense={existing}
        defaultDate={month ? defaultDateForMonth(month) : todayISO()}
        submitLabel={isEdit ? 'Guardar cambios' : 'Agregar gasto'}
        onSubmit={handleSubmit}
      />
    </Screen>
  );
}