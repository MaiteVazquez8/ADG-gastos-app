import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { CategoryBadge } from '@/components/CategoryBadge';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { SummaryCard } from '@/components/SummaryCard';
import { resolveCategory } from '@/utils/categories';
import { formatISODate, formatISODateLong, toISODate } from '@/utils/date';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <AppText variant="body" tone="secondary">
        {label}
      </AppText>
      <AppText variant="body" weight="600">
        {value}
      </AppText>
    </View>
  );
}

export default function ExpenseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { palette } = useAppTheme();

  const expense = useExpenseStore((state) => state.expenses.find((e) => e.id === id));
  const deleteExpense = useExpenseStore((state) => state.deleteExpense);
  const categories = useFinanceStore((state) => state.categories);

  const meta = useMemo(
    () => (expense ? resolveCategory(categories, expense.category) : null),
    [expense, categories],
  );

  if (!expense || !meta) {
    return (
      <Screen scroll>
        <Header title="Gasto" showBack />
        <EmptyState
          icon="help-circle-outline"
          title="Gasto no encontrado"
          message="Este gasto puede haber sido eliminado."
          action={<Button label="Volver" variant="secondary" onPress={() => router.back()} />}
        />
      </Screen>
    );
  }

  const note = expense.note?.trim();

  // createdAt is a UTC timestamp; convert it to the local calendar date so the
  // label matches the rest of the app (which works with local YYYY-MM-DD).
  const createdDate = Number.isNaN(Date.parse(expense.createdAt))
    ? expense.date
    : toISODate(new Date(expense.createdAt));

  const confirmDelete = () => {
    Alert.alert('Eliminar gasto', 'Se eliminará definitivamente. Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteExpense(expense.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <Header title="Detalles del gasto" showBack />

      <View style={styles.content}>
        <SummaryCard label="Monto" value={expense.amount}>
          <View style={styles.badgeRow}>
            <CategoryBadge category={meta} />
          </View>
        </SummaryCard>

        {note ? (
          <View
            style={[
              styles.noteCard,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
          >
            <AppText variant="label" tone="secondary">
              Descripción
            </AppText>
            <AppText variant="body">{note}</AppText>
          </View>
        ) : null}

        <View
          style={[
            styles.infoCard,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <DetailRow label="Fecha" value={formatISODateLong(expense.date)} />
          <View style={[styles.divider, { backgroundColor: palette.border }]} />
          <DetailRow label="Categoría" value={meta.name} />
          <View style={[styles.divider, { backgroundColor: palette.border }]} />
          <DetailRow label="Creado" value={formatISODate(createdDate)} />
        </View>

        <View style={styles.actions}>
          <Button
            label="Editar gasto"
            onPress={() => router.push(`/add-expense?id=${expense.id}`)}
          />
          <Button
            label="Eliminar gasto"
            variant="danger"
            onPress={confirmDelete}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  noteCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  infoCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  divider: {
    height: 1,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});