import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Button } from '@/components/Button';
import { BudgetCategoryCard } from '@/components/BudgetCategoryCard';
import { ChartCard } from '@/components/ChartCard';
import { DonutChart } from '@/components/charts/DonutChart';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { IncomeList } from '@/components/IncomeList';
import { MonthSelector } from '@/components/MonthSelector';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { StatTile } from '@/components/StatTile';
import { SummaryCard } from '@/components/SummaryCard';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthStore } from '@/store/useMonthStore';
import {
  buildBudgetRows,
  computeMonthSummary,
  distributionIsComplete,
  distributionSum,
  incomesForMonth,
  resolveMonthDistribution,
  totalIncomeForMonth,
} from '@/utils/budget';
import { filterByMonth } from '@/utils/aggregation';
import { formatCurrency } from '@/utils/currency';
import { formatMonthLabel } from '@/utils/date';

export default function PresupuestoScreen() {
  const { palette } = useAppTheme();
  const router = useRouter();

  const monthKey = useMonthStore((state) => state.monthKey);
  const categories = useFinanceStore((state) => state.categories);
  const incomes = useFinanceStore((state) => state.incomes);
  const distributionsByMonth = useFinanceStore((state) => state.distributionsByMonth);
  const defaultDistribution = useFinanceStore((state) => state.defaultDistribution);
  const expenses = useExpenseStore((state) => state.expenses);

  const monthIncomes = useMemo(() => incomesForMonth(incomes, monthKey), [incomes, monthKey]);
  const incomeTotal = useMemo(() => totalIncomeForMonth(incomes, monthKey), [incomes, monthKey]);
  const activeDistribution = useMemo(
    () => resolveMonthDistribution(distributionsByMonth, defaultDistribution, monthKey),
    [distributionsByMonth, defaultDistribution, monthKey],
  );
  const monthExpenses = useMemo(() => filterByMonth(expenses, monthKey), [expenses, monthKey]);

  const complete = distributionIsComplete(activeDistribution);
  const distributed = distributionSum(activeDistribution);

  const summary = useMemo(
    () => computeMonthSummary(categories, activeDistribution, incomes, monthExpenses, monthKey),
    [categories, activeDistribution, incomes, monthExpenses, monthKey],
  );
  const rows = useMemo(
    () => buildBudgetRows(categories, activeDistribution, incomeTotal, monthExpenses),
    [categories, activeDistribution, incomeTotal, monthExpenses],
  );
  const rowsWithPercentage = rows.filter((row) => row.percentage > 0);
  const showDistribution = incomeTotal > 0 && complete && rowsWithPercentage.length > 0;

  return (
    <Screen scroll>
      <Header
        title="Presupuesto"
        subtitle={formatMonthLabel(monthKey)}
        right={<ThemeToggleButton />}
      />

      <Animated.View key={monthKey} entering={FadeInUp.duration(340)} style={styles.content}>
        <MonthSelector />

        {incomeTotal > 0 ? (
          <SummaryCard
            label="Disponible del mes"
            value={summary.available}
            valueColor={summary.available >= 0 ? palette.success : palette.danger}
          >
            <View style={styles.tileRow}>
              <StatTile label="Ingresos" value={formatCurrency(summary.incomeTotal)} color={palette.success} />
              <StatTile label="Gastos" value={formatCurrency(summary.spentTotal)} color={palette.danger} />
            </View>
            <View style={styles.tileRow}>
              <StatTile label="Presupuestado" value={formatCurrency(summary.budgetedTotal)} color={palette.textSecondary} />
              <StatTile label="Gastado" value={`${summary.spentPercentOfIncome}%`} color={palette.textPrimary} />
            </View>
            <View style={styles.summaryActions}>
              <Button
                label="Agregar ingreso"
                variant="secondary"
                size="sm"
                icon={<Ionicons name="add" size={18} color={palette.primary} />}
                onPress={() => router.push({ pathname: '/ingresos', params: { month: monthKey } })}
                style={styles.summaryButton}
              />
              {complete ? (
                <Button
                  label="Editar distribución"
                  variant="ghost"
                  size="sm"
                  onPress={() => router.push('/distribucion')}
                  style={styles.summaryButton}
                />
              ) : null}
            </View>
          </SummaryCard>
        ) : (
          <EmptyState
            icon="cash-outline"
            title="Todavía no registraste ingresos este mes."
            message="Agregá tu sueldo, ventas u otros ingresos para armar tu presupuesto."
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

        {incomeTotal > 0 ? (
          <>
            {monthIncomes.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <AppText variant="subtitle">
                    Ingresos · {monthIncomes.length}
                  </AppText>
                  <Button
                    label="Agregar"
                    variant="ghost"
                    size="sm"
                    icon={<Ionicons name="add" size={16} color={palette.primary} />}
                    onPress={() => router.push({ pathname: '/ingresos', params: { month: monthKey } })}
                  />
                </View>
                <IncomeList
                  incomes={monthIncomes}
                  onEdit={(id) => router.push(`/ingresos?id=${id}`)}
                />
              </View>
            ) : null}

            {showDistribution ? (
              <>
                <ChartCard
                  title="Distribución"
                  subtitle={`${distributed}% de tus ingresos`}
                >
                  <DonutContent rows={rowsWithPercentage} distributed={distributed} />
                </ChartCard>

                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <AppText variant="subtitle">Asignado por categoría</AppText>
                    <Button
                      label="Editar"
                      variant="ghost"
                      size="sm"
                      onPress={() => router.push('/distribucion')}
                    />
                  </View>
                  <View style={styles.cardList}>
                    {rowsWithPercentage.map((row) => (
                      <BudgetCategoryCard
                        key={row.categoryId}
                        row={row}
                        mode="distribution"
                        onPress={() => router.push('/distribucion')}
                      />
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <EmptyState
                icon="options-outline"
                title="Configurá cómo querés distribuir tus ingresos."
                message="Asigná un porcentaje a cada categoría. La suma debe ser exactamente 100%."
                action={
                  <View style={styles.emptyAction}>
                    <Button
                      label="Configurar distribución"
                      onPress={() => router.push('/distribucion')}
                    />
                  </View>
                }
              />
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AppText variant="subtitle">Configuración</AppText>
              </View>
              <View style={styles.configList}>
                <ConfigRow
                  icon="swap-horizontal"
                  label="Distribución habitual"
                  onPress={() => router.push('/distribucion-predeterminada')}
                />
                <ConfigRow
                  icon="albums-outline"
                  label="Categorías"
                  onPress={() => router.push('/categorias')}
                />
              </View>
            </View>
          </>
        ) : null}
      </Animated.View>
    </Screen>
  );
}

function ConfigRow({
  icon,
  label,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  const { palette } = useAppTheme();

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.configRow, { backgroundColor: palette.card, borderColor: palette.border }]}
    >
      <View style={[styles.configIcon, { backgroundColor: palette.primarySoft }]}>
        <Ionicons name={icon} size={18} color={palette.primary} />
      </View>
      <AppText variant="body" weight="600" style={styles.flex} numberOfLines={1}>
        {label}
      </AppText>
      <Ionicons name="chevron-forward" size={18} color={palette.textTertiary} />
    </PressableScale>
  );
}

function DonutContent({
  rows,
  distributed,
}: {
  rows: ReturnType<typeof buildBudgetRows>;
  distributed: number;
}) {
  const segments = useMemo(
    () =>
      rows.map((row) => ({
        key: row.categoryId,
        label: row.name,
        color: row.color,
        value: row.budget,
      })),
    [rows],
  );

  return (
    <View>
      <DonutChart
        data={segments}
        centerLabel="Distribuido"
        centerValue={`${distributed}%`}
      />
      <View style={styles.legend}>
        {rows.map((row) => (
          <View
            key={row.categoryId}
            style={styles.legendRow}
            accessibilityLabel={`${row.name} ${row.percentage}%`}
          >
            <MaterialCommunityIcons name={row.icon} size={18} color={row.color} />
            <AppText variant="body" style={styles.flex} numberOfLines={1}>
              {row.name}
            </AppText>
            <AppText variant="caption" tone="tertiary" tabular style={styles.legendPercent}>
              {row.percentage}%
            </AppText>
            <AppText variant="body" weight="600" tabular>
              {formatCurrency(row.budget)}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  summaryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryButton: {
    flex: 1,
    minWidth: 150,
  },
  tileRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  emptyAction: {
    alignSelf: 'stretch',
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
  configList: {
    gap: spacing.sm,
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  configIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendPercent: {
    width: 56,
    textAlign: 'right',
  },
  flex: {
    flex: 1,
  },
});