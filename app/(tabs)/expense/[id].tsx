import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import { paymentMethodLabel } from '@/constants/finance';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import type { IconName } from '@/types';
import { resolveCategory } from '@/utils/categories';
import { formatArsSpaced } from '@/utils/currency';
import { formatISODateFullEs } from '@/utils/date';
import { alpha } from '@/utils/color';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <AppText variant="body" tone="secondary">
        {label}
      </AppText>
      <AppText variant="body" weight="600" numberOfLines={1} style={styles.detailValue}>
        {value}
      </AppText>
    </View>
  );
}

export default function ExpenseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { palette, isDark } = useAppTheme();

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
        <Header title="Detalle del movimiento" />
        <EmptyState
          icon="help-circle-outline"
          title="Movimiento no encontrado"
          message="Este movimiento puede haber sido eliminado."
          action={<Button label="Volver" variant="secondary" onPress={() => router.back()} />}
        />
      </Screen>
    );
  }

  const note = expense.note?.trim();
  const title = note ? note : meta.name;

  const createdAt = Number.isNaN(Date.parse(expense.createdAt)) ? null : new Date(expense.createdAt);
  const timeLabel = createdAt
    ? `${String(createdAt.getHours()).padStart(2, '0')}:${String(createdAt.getMinutes()).padStart(2, '0')}`
    : null;
  const dateLabel = timeLabel ? `${formatISODateFullEs(expense.date)} · ${timeLabel}` : formatISODateFullEs(expense.date);

  const confirmDelete = () => {
    Alert.alert('Eliminar movimiento', 'Se eliminará definitivamente. Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteExpense(expense.id);
          router.navigate('/actividad');
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <Header title="Detalle del movimiento" />

      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: alpha(meta.color, isDark ? 0.22 : 0.14) }]}>
            <MaterialCommunityIcons name={meta.icon as IconName} size={34} color={meta.color} />
          </View>
          <AppText variant="subtitle" weight="800" center numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {title}
          </AppText>
          <AppText variant="hero" weight="800" tabular center>
            − {formatArsSpaced(expense.amount)}
          </AppText>
          <View style={[styles.statusPill, { backgroundColor: palette.primary }]}>
            <AppText variant="caption" weight="700" style={{ color: palette.onPrimary }}>
              Registrado
            </AppText>
          </View>
        </View>

        <View style={[styles.detailsCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <DetailRow label="Categoría" value={meta.name} />
          <View style={[styles.divider, { backgroundColor: palette.border }]} />
          <DetailRow label="Fecha" value={dateLabel} />
          <View style={[styles.divider, { backgroundColor: palette.border }]} />
          <DetailRow label="Medio de pago" value={paymentMethodLabel(expense.paymentMethod)} />
          <View style={[styles.divider, { backgroundColor: palette.border }]} />
          <DetailRow label="Tipo" value="Gasto" />
          <View style={[styles.divider, { backgroundColor: palette.border }]} />
          <DetailRow label="Nota" value={note ?? '—'} />
        </View>

        <View style={styles.actions}>
          <Button
            label="Editar movimiento"
            onPress={() => router.navigate(`/agregar?tipo=gasto&id=${expense.id}`)}
          />
          <Button
            label="Volver a movimientos"
            variant="secondary"
            onPress={() => router.navigate('/actividad')}
          />
          <Button
            label="Eliminar movimiento"
            variant="ghost"
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
    gap: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statusPill: {
    height: 28,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
  },
  actions: {
    gap: spacing.md,
  },
});
