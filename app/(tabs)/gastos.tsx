import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BudgetCategoryCard } from '@/components/BudgetCategoryCard';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ExpenseCard } from '@/components/ExpenseCard';
import { Header } from '@/components/Header';
import { MonthSelector } from '@/components/MonthSelector';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { StatTile } from '@/components/StatTile';
import { SummaryCard } from '@/components/SummaryCard';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { layout, radius, shadows, spacing } from '@/constants/layout';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthStore } from '@/store/useMonthStore';
import {
  filterByMonth,
  sortExpensesByDateDesc,
} from '@/utils/aggregation';
import {
  buildBudgetRows,
  computeMonthSummary,
  distributionSum,
  resolveMonthDistribution,
  totalIncomeForMonth,
} from '@/utils/budget';
import { formatCurrency } from '@/utils/currency';
import { formatMonthLabel } from '@/utils/date';

export default function GastosScreen() {
  const { palette } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const monthKey = useMonthStore((state) => state.monthKey);
  const categories = useFinanceStore((state) => state.categories);
  const incomes = useFinanceStore((state) => state.incomes);
  const distributionsByMonth = useFinanceStore((state) => state.distributionsByMonth);
  const defaultDistribution = useFinanceStore((state) => state.defaultDistribution);
  const expenses = useExpenseStore((state) => state.expenses);

  const activeDistribution = useMemo(
    () => resolveMonthDistribution(distributionsByMonth, defaultDistribution, monthKey),
    [distributionsByMonth, defaultDistribution, monthKey],
  );
  const monthExpenses = useMemo(() => filterByMonth(expenses, monthKey), [expenses, monthKey]);
  const incomeTotal = useMemo(() => totalIncomeForMonth(incomes, monthKey), [incomes, monthKey]);
  const distributed = distributionSum(activeDistribution);

  const summary = useMemo(
    () =>
      computeMonthSummary(
        categories,
        activeDistribution,
        incomes,
        monthExpenses,
        monthKey,
      ),
    [categories, activeDistribution, incomes, monthExpenses, monthKey],
  );
  const rows = useMemo(
    () => buildBudgetRows(categories, activeDistribution, incomeTotal, monthExpenses),
    [categories, activeDistribution, incomeTotal, monthExpenses],
  );
  const visibleRows = rows.filter((row) => row.percentage > 0 || row.spent > 0);
  const recentExpenses = useMemo(
    () => sortExpensesByDateDesc(monthExpenses).slice(0, 6),
    [monthExpenses],
  );

  const hasExpenses = monthExpenses.length > 0;

  return (
    <Screen
      scroll
      overlay={
        <View style={[styles.fab, { bottom: Math.max(insets.bottom, spacing.lg) }]}>
          <AddExpenseFab />
        </View>
      }
    >
      <Header title="Gastos" subtitle={formatMonthLabel(monthKey)} right={<ThemeToggleButton />} />

      <Animated.View key={monthKey} entering={FadeInUp.duration(340)} style={styles.content}>
        <MonthSelector />

        {incomeTotal > 0 ? (
          <>
            <SummaryCard
              label="Disponible"
              value={summary.available}
              valueColor={summary.available >= 0 ? palette.success : palette.danger}
            >
              <View style={styles.tileRow}>
                <StatTile label="Ingresos" value={formatCurrency(summary.incomeTotal)} color={palette.success} />
                <StatTile label="Presupuestado" value={formatCurrency(summary.budgetedTotal)} color={palette.textSecondary} />
              </View>
              <View style={styles.tileRow}>
                <StatTile label="Gastado" value={formatCurrency(summary.spentTotal)} color={palette.danger} />
                <StatTile label="% del ingreso" value={`${summary.spentPercentOfIncome}%`} color={palette.textPrimary} />
              </View>

              <AppText variant="caption" tone="secondary" numberOfLines={2} style={styles.metaLine}>
                {summary.expenseCount} {summary.expenseCount === 1 ? 'gasto' : 'gastos'}
                {summary.topCategory ? ` · Mayor gasto: ${summary.topCategory.name}` : ''}
                {summary.lowestAvailable ? ` · Menos disponible: ${summary.lowestAvailable.name}` : ''}
              </AppText>
            </SummaryCard>

            {!summary.distributionValid ? (
              <View style={[styles.invalidBanner, { backgroundColor: palette.dangerSoft, borderColor: palette.danger }]}>
                <View style={styles.flex}>
                  <AppText variant="body" weight="600" style={{ color: palette.danger }}>
                    Tu distribución suma {distributed}%
                  </AppText>
                  <AppText variant="caption" tone="secondary">
                    Ajustala a 100% para que los presupuestos por categoría sean correctos.
                  </AppText>
                </View>
                <Button label="Ajustar" variant="secondary" size="sm" onPress={() => router.push('/distribucion')} />
              </View>
            ) : null}

            {recentExpenses.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <AppText variant="subtitle">Movimientos</AppText>
                  <PressableScale
                    onPress={() => router.push('/history')}
                    accessibilityRole="button"
                    accessibilityLabel="Ver historial completo"
                    hitSlop={8}
                  >
                    <AppText variant="label" tone="accent">
                      Ver historial
                    </AppText>
                  </PressableScale>
                </View>
                <View style={styles.cardList}>
                  {recentExpenses.map((expense, index) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      index={index}
                      showDate
                      onPress={() => router.push(`/expense/${expense.id}`)}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {visibleRows.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <AppText variant="subtitle">Por categoría</AppText>
                  <Button
                    label="Editar distribución"
                    variant="ghost"
                    size="sm"
                    onPress={() => router.push('/distribucion')}
                  />
                </View>
                <View style={styles.cardList}>
                  {visibleRows.map((row) => (
                    <BudgetCategoryCard
                      key={row.categoryId}
                      row={row}
                      onPress={() => router.push('/distribucion')}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        ) : (
          <EmptyState
            icon="cash-outline"
            title="Todavía no registraste ingresos este mes."
            message="Sumá ingresos en Presupuesto para ver cuánto podés gastar."
            action={
              <View style={styles.emptyAction}>
                <Button
                  label="Agregar ingreso"
                  onPress={() => router.push({ pathname: '/ingresos', params: { month: monthKey } })}
                />
              </View>
            }
          />
        )}

        {incomeTotal > 0 && !hasExpenses ? (
          <EmptyState
            icon="receipt-outline"
            title="Todavía no registraste gastos este mes."
            message="Tu primer gasto aparecerá acá al toque."
            action={
              <View style={styles.emptyAction}>
                <Button
                  label="Agregar gasto"
                  onPress={() => router.push({ pathname: '/add-expense', params: { month: monthKey } })}
                />
              </View>
            }
          />
        ) : null}
      </Animated.View>
    </Screen>
  );
}

function AddExpenseFab() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const monthKey = useMonthStore((state) => state.monthKey);

  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/add-expense', params: { month: monthKey } })}
      accessibilityRole="button"
      accessibilityLabel="Agregar gasto"
      style={[styles.fabButton, shadows.fab]}
    >
      <LinearGradient
        colors={[palette.primary, palette.primaryStrong]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fabGradient}
      >
        <Ionicons name="add" size={30} color={palette.onPrimary} />
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  tileRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  metaLine: {
    marginTop: spacing.md,
  },
  invalidBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardList: {
    gap: spacing.sm,
  },
  emptyAction: {
    alignSelf: 'stretch',
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
  },
  fabButton: {
    width: layout.fabSize,
    height: layout.fabSize,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fabGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
});