import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { DonutChart } from '@/components/charts/DonutChart';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { FilterTabs } from '@/components/FilterTabs';
import { Header } from '@/components/Header';
import { LineChart } from '@/components/LineChart';
import { MonthPill } from '@/components/MonthPill';
import { PressableScale } from '@/components/PressableScale';
import { RadialLimitChart } from '@/components/RadialLimitChart';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import { useBudgetStore, resolveMonthLimits } from '@/store/useBudgetStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthStore } from '@/store/useMonthStore';
import { dailyTotals, totalsByCategory } from '@/utils/aggregation';
import { formatArs, formatPercentEs } from '@/utils/currency';
import { formatMonthKeyTiny, monthKeyOf, todayISO } from '@/utils/date';
import { useMotion } from '@/hooks/useMotion';

export default function AnalisisScreen() {
  const { palette } = useAppTheme();
  const router = useRouter();
  const motion = useMotion();
  const { width } = useWindowDimensions();
  const wide = width >= 980;

  const monthKey = useMonthStore((state) => state.monthKey);
  const expenses = useExpenseStore((state) => state.expenses);
  const categories = useFinanceStore((state) => state.categories);
  const limitsByMonth = useBudgetStore((state) => state.limitsByMonth);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const monthExpenses = useMemo(
    () => expenses.filter((expense) => expense.date.startsWith(monthKey)),
    [expenses, monthKey],
  );

  const spentTotal = useMemo(
    () => monthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [monthExpenses],
  );

  const chartPoints = useMemo(() => {
    const totals = dailyTotals(monthExpenses, monthKey);
    const isCurrentMonth = monthKey === monthKeyOf(new Date());
    const todayDay = Number(todayISO().slice(8, 10));
    const limit = isCurrentMonth ? Math.min(todayDay, totals.length) : totals.length;
    let cumulative = 0;
    const points: { label: string; value: number }[] = [];
    const monthTin = formatMonthKeyTiny(monthKey);
    for (let i = 0; i < limit; i += 1) {
      cumulative += totals[i].total;
      points.push({ label: i === 0 ? `1 ${monthTin}` : `${i + 1} ${monthTin}`, value: cumulative });
    }
    if (points.length === 0) {
      points.push({ label: `1 ${monthTin}`, value: 0 });
    }
    return points;
  }, [monthExpenses, monthKey]);

  const categoryTotals = useMemo(() => {
    const knownIds = categories.map((category) => category.id);
    const totals = totalsByCategory(monthExpenses, knownIds).slice(0, 5);
    const grand = totals.reduce((sum, entry) => sum + entry.total, 0);
    return { totals, grand };
  }, [monthExpenses, categories]);

  const expenseCategories = useMemo(
    () => categories.filter((category) => (category.type ?? 'gasto') === 'gasto'),
    [categories],
  );

  const categoryChips = useMemo(
    () => [
      { label: 'Todas', value: 'all' },
      ...expenseCategories.map((category) => ({ label: category.name, value: category.id })),
    ],
    [expenseCategories],
  );

  // Vista por categoría: gasto del mes vs. límite efectivo de la categoría.
  const selectedLimitRow = useMemo(() => {
    if (selectedCategory === 'all') {
      return null;
    }
    const limits = resolveMonthLimits(limitsByMonth, monthKey);
    const spent = monthExpenses
      .filter((expense) => expense.category === selectedCategory)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const limit = limits[selectedCategory]?.amount ?? 0;
    return { spent, limit };
  }, [selectedCategory, limitsByMonth, monthKey, monthExpenses]);

  const entering = motion ? FadeInUp.duration(340) : undefined;
  const isEmpty = monthExpenses.length === 0;
  const chartEndLabel = chartPoints[chartPoints.length - 1]?.label ?? `1 ${formatMonthKeyTiny(monthKey)}`;

  return (
    <Screen scroll>
      <Header title="Estadísticas" />

      <Animated.View entering={entering} key={monthKey} style={styles.content}>
        <AppText variant="title" weight="800" style={styles.headline}>
          Entendé tus números.
        </AppText>

        <View style={styles.controlsRow}>
          <MonthPill />
          <PressableScale
            onPress={() => router.navigate('/comparacion')}
            accessibilityRole="button"
            accessibilityLabel="Comparar meses"
            hitSlop={8}
          >
            <AppText variant="label" tone="accent" weight="600">
              Comparar meses ›
            </AppText>
          </PressableScale>
        </View>

        {isEmpty ? (
          <EmptyState
            icon="trending-up-outline"
            title="Sin gastos este mes."
            message="Cuando registres gastos vas a ver acá cómo evolucionan tus números."
            action={
              <Button
                label="Agregar gasto"
                onPress={() => router.navigate('/agregar')}
              />
            }
          />
        ) : (
          <>
            <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }, wide && styles.cardWide]}>
              <AppText variant="label" tone="secondary">
                Gastos acumulados
              </AppText>
              <AppText variant="title" weight="800" tabular>
                {formatArs(spentTotal)}
              </AppText>
              <LineChart
                data={chartPoints}
                height={150}
                showEndLabels
              />
              <View style={styles.chartAxisRow}>
                <AppText variant="caption" tone="tertiary">1 {formatMonthKeyTiny(monthKey)}</AppText>
                <AppText variant="caption" tone="tertiary">{chartEndLabel}</AppText>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <AppText variant="subtitle" weight="700" style={styles.donutTitle}>
                ¿En qué se va tu dinero?
              </AppText>
              <FilterTabs
                options={categoryChips}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
              {selectedCategory === 'all' ? (
                <>
                  <View style={styles.donutRow}>
                    <DonutChart
                      data={categoryTotals.totals.map((entry) => {
                        const meta = categories.find((category) => category.id === entry.category);
                        return {
                          key: entry.category,
                          label: meta?.name ?? entry.category,
                          color: meta?.color ?? '#7D7D7D',
                          value: entry.total,
                        };
                      })}
                      size={150}
                      thickness={22}
                      centerLabel="Total"
                      centerValue={`${formatCompact(spentTotal)}`}
                    />
                    <View style={styles.legend}>
                      {categoryTotals.totals.map((entry) => {
                        const meta = categories.find((category) => category.id === entry.category);
                        return (
                          <View key={entry.category} style={styles.legendRow}>
                            <View style={[styles.legendSquare, { backgroundColor: meta?.color ?? '#7D7D7D' }]} />
                            <AppText variant="caption" tone="secondary" numberOfLines={1} style={styles.legendLabel}>
                              {meta?.name ?? entry.category}
                            </AppText>
                            <AppText variant="caption" tone="tertiary" tabular>
                              {formatPercentEs(entry.percentage)}
                            </AppText>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                  <AppText variant="caption" tone="tertiary" style={styles.donutFootnote}>
                    Total de gastos del período
                  </AppText>
                </>
              ) : (
                <View style={styles.categoryChartWrap}>
                  <RadialLimitChart
                    spent={selectedLimitRow?.spent ?? 0}
                    limit={selectedLimitRow?.limit ?? 0}
                    size={190}
                    thickness={26}
                  />
                  <View style={styles.categoryAmounts}>
                    <View style={styles.categoryAmountTile}>
                      <AppText variant="caption" tone="secondary" style={styles.tileLabel}>
                        Gastado
                      </AppText>
                      <AppText variant="subtitle" weight="800" tabular numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                        {formatArs(selectedLimitRow?.spent ?? 0)}
                      </AppText>
                    </View>
                    <View style={styles.categoryAmountTile}>
                      <AppText variant="caption" tone="secondary" style={styles.tileLabel}>
                        Límite
                      </AppText>
                      <AppText variant="subtitle" weight="800" tabular numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                        {selectedLimitRow && selectedLimitRow.limit > 0 ? formatArs(selectedLimitRow.limit) : 'Sin límite'}
                      </AppText>
                    </View>
                  </View>
                  {selectedLimitRow && selectedLimitRow.limit > 0 ? (
                    selectedLimitRow.spent <= selectedLimitRow.limit ? (
                      <AppText variant="label" weight="700" style={[styles.statusLine, { color: palette.primary }]}>
                        Te quedan {formatArs(selectedLimitRow.limit - selectedLimitRow.spent)}
                      </AppText>
                    ) : (
                      <AppText variant="label" weight="700" style={[styles.statusLine, { color: palette.danger }]}>
                        Te excediste por {formatArs(selectedLimitRow.spent - selectedLimitRow.limit)}
                      </AppText>
                    )
                  ) : (
                    <PressableScale
                      onPress={() => router.navigate(`/editar-limite?categoria=${selectedCategory}`)}
                      accessibilityRole="button"
                      accessibilityLabel="Asignar un límite a esta categoría"
                      hitSlop={8}
                    >
                      <AppText variant="label" tone="accent" weight="600">
                        Sin límite asignado · Asignar límite ›
                      </AppText>
                      <AppText variant="caption" tone="tertiary">
                        Gastaste {formatArs(selectedLimitRow?.spent ?? 0)} este mes.
                      </AppText>
                    </PressableScale>
                  )}
                </View>
              )}
            </View>
          </>
        )}
      </Animated.View>
    </Screen>
  );
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1).replace('.', ',')}m`;
  }
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}k`;
  }
  return `$${Math.round(value)}`;
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  headline: {
    fontSize: 30,
    lineHeight: 36,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  cardWide: {},
  chartAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  donutTitle: {
    marginBottom: spacing.xs,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  legend: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 150,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendLabel: {
    flex: 1,
  },
  donutFootnote: {
    marginTop: spacing.xs,
  },
  categoryChartWrap: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
  categoryAmounts: {
    flexDirection: 'row',
    gap: spacing.md,
    alignSelf: 'stretch',
  },
  categoryAmountTile: {
    flex: 1,
    minWidth: 0,
    borderRadius: radius.md,
    backgroundColor: '#222222',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 4,
  },
  tileLabel: {
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  statusLine: {
    textAlign: 'center',
  },
});
