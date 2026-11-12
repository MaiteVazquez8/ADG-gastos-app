import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { Alert, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AdgHeroCard } from '@/components/AdgHeroCard';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { LineChart } from '@/components/LineChart';
import { MonthPill } from '@/components/MonthPill';
import { PressableScale } from '@/components/PressableScale';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import { useBudgetStore, resolveMonthLimits, totalMonthLimit } from '@/store/useBudgetStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthStore } from '@/store/useMonthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { dailyTotals } from '@/utils/aggregation';
import type { IconName } from '@/types';
import { buildMovements, type Movement } from '@/utils/movements';
import { formatArs, formatPercentEs, formatSignedArs } from '@/utils/currency';
import { formatMonthLabel, formatRelativeDay, monthKeyOf, todayISO } from '@/utils/date';
import { useMotion } from '@/hooks/useMotion';
import { alpha } from '@/utils/color';

const MOBILE_TILE_RADIUS = radius.lg;

export default function InicioScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 980;
  return wide ? <DesktopInicio /> : <MobileInicio />;
}

function useInicioData() {
  const monthKey = useMonthStore((state) => state.monthKey);
  const categories = useFinanceStore((state) => state.categories);
  const incomes = useFinanceStore((state) => state.incomes);
  const expenses = useExpenseStore((state) => state.expenses);
  const limitsByMonth = useBudgetStore((state) => state.limitsByMonth);

  const monthExpenses = useMemo(
    () => expenses.filter((expense) => expense.date.startsWith(monthKey)),
    [expenses, monthKey],
  );
  const monthIncomes = useMemo(
    () => incomes.filter((income) => income.date.startsWith(monthKey)),
    [incomes, monthKey],
  );

  const incomeTotal = useMemo(
    () => monthIncomes.reduce((sum, income) => sum + income.amount, 0),
    [monthIncomes],
  );
  const spentTotal = useMemo(
    () => monthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [monthExpenses],
  );

  const budgetTotal = useMemo(() => {
    const limits = resolveMonthLimits(limitsByMonth, monthKey);
    return totalMonthLimit(limits);
  }, [limitsByMonth, monthKey]);

  const budgetPercent = budgetTotal > 0 ? (spentTotal / budgetTotal) * 100 : 0;
  const available = incomeTotal - spentTotal;

  const movements = useMemo(
    () => buildMovements(expenses, incomes, categories),
    [expenses, incomes, categories],
  );

  return {
    monthKey,
    categories,
    monthExpenses,
    monthIncomes,
    incomeTotal,
    spentTotal,
    budgetTotal,
    budgetPercent,
    available,
    movements,
  };
}

function MovementIcon({ movement, size = 44 }: { movement: Movement; size?: number }) {
  const { palette, isDark } = useAppTheme();
  const tint = movement.kind === 'ingreso' ? palette.primary : movement.color;
  return (
    <View
      style={[
        styles.movementIcon,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: alpha(tint, isDark ? 0.22 : 0.14),
        },
      ]}
    >
      <MaterialCommunityIcons
        name={movement.icon as IconName}
        size={Math.round(size * 0.45)}
        color={movement.kind === 'ingreso' ? palette.primary : tint}
      />
    </View>
  );
}

function MovementRow({ movement, onPress }: { movement: Movement; onPress: () => void }) {
  const { palette } = useAppTheme();
  const positive = movement.signedAmount >= 0;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${movement.title}, ${formatSignedArs(movement.signedAmount)}`}
      style={styles.movementRow}
    >
      <MovementIcon movement={movement} />
      <View style={styles.movementText}>
        <AppText variant="body" weight="600" numberOfLines={1}>
          {movement.title}
        </AppText>
        <AppText variant="caption" tone="tertiary" numberOfLines={1}>
          {movement.subtitle} · {formatRelativeDay(movement.date)}
        </AppText>
      </View>
      <AppText
        variant="subtitle"
        weight="700"
        tabular
        numberOfLines={1}
        style={{ color: positive ? palette.primary : palette.textPrimary }}
      >
        {formatSignedArs(movement.signedAmount)}
      </AppText>
    </PressableScale>
  );
}

function openMovement(router: ReturnType<typeof useRouter>, movement: Movement) {
  if (movement.kind === 'gasto') {
    router.navigate(`/expense/${movement.id}`);
  } else {
    router.navigate(`/agregar?tipo=ingreso&id=${movement.id}`);
  }
}

function MobileInicio() {
  const { palette } = useAppTheme();
  const router = useRouter();
  const motion = useMotion();
  const budgetAlerts = useSettingsStore((state) => state.budgetAlerts);
  const {
    monthKey,
    incomeTotal,
    spentTotal,
    budgetTotal,
    budgetPercent,
    available,
    movements,
    categories,
  } = useInicioData();
  const expenseStore = useExpenseStore((state) => state.expenses);
  const limitsByMonth = useBudgetStore((state) => state.limitsByMonth);

  // Alerta de presupuesto al 80%: una vez por mes y por sesión si está activada.
  const alertedMonthsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!budgetAlerts) {
      return;
    }
    if (alertedMonthsRef.current.has(monthKey)) {
      return;
    }
    const limits = resolveMonthLimits(limitsByMonth, monthKey);
    const monthExpenses = expenseStore.filter((expense) => expense.date.startsWith(monthKey));
    const over = Object.entries(limits)
      .map(([categoryId, limit]) => {
        const spent = monthExpenses
          .filter((expense) => expense.category === categoryId)
          .reduce((sum, expense) => sum + expense.amount, 0);
        return { categoryId, limit: limit.amount, spent, notify80: limit.notify80 };
      })
      .filter((entry) => entry.notify80 && entry.limit > 0 && entry.spent / entry.limit >= 0.8);
    if (over.length > 0) {
      alertedMonthsRef.current.add(monthKey);
      const names = over
        .map((entry) => {
          const meta = categories.find((category) => category.id === entry.categoryId);
          return meta?.name ?? 'Una categoría';
        })
        .join(', ');
      Alert.alert(
        'Presupuesto al 80%',
        `${names} ${over.length === 1 ? 'llegó' : 'llegaron'} al 80% del límite mensual.`,
      );
    }
  }, [budgetAlerts, monthKey, expenseStore, limitsByMonth, categories]);

  const recent = movements.slice(0, 3);
  const isEmpty = movements.length === 0 && incomeTotal === 0;
  const entering = motion ? FadeInUp.duration(340) : undefined;

  return (
    <Screen scroll>
      <Header
        title="Inicio"
        right={<MonthPill />}
      />

      <Animated.View entering={entering} key={monthKey} style={styles.content}>
        <AppText variant="title" weight="800" style={styles.headline}>
          Tu mes,{'\n'}bajo control.
        </AppText>

        {isEmpty ? (
          <EmptyState
            icon="cash-outline"
            title="Todavía no hay movimientos este mes."
            message="Agregá tu primer gasto o ingreso y mirá cómo ADG ordena tus números."
            action={
              <Button
                label="+ Nuevo movimiento"
                onPress={() => router.navigate('/agregar')}
              />
            }
          />
        ) : (
          <>
            <AdgHeroCard
              label="DISPONIBLE DEL MES"
              value={available}
              footnote="Ingresos − gastos · ARS"
            />

            <View style={styles.tileRow}>
              <View style={[styles.tile, { backgroundColor: palette.card, borderColor: palette.border }]}>
                <AppText variant="caption" tone="secondary" style={styles.tileLabel}>
                  Ingresos
                </AppText>
                <AppText variant="subtitle" weight="800" tabular style={{ color: palette.primary }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                  {formatArs(incomeTotal)}
                </AppText>
              </View>
              <View style={[styles.tile, { backgroundColor: palette.card, borderColor: palette.border }]}>
                <AppText variant="caption" tone="secondary" style={styles.tileLabel}>
                  Gastos
                </AppText>
                <AppText variant="subtitle" weight="800" tabular numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                  {formatArs(spentTotal)}
                </AppText>
              </View>
            </View>

            <PressableScale
              onPress={() => router.navigate('/presupuestos')}
              accessibilityRole="button"
              accessibilityLabel={`Presupuestado ${formatArs(budgetTotal)}, ${formatPercentEs(budgetPercent)} gastado`}
              style={[styles.budgetCard, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <View style={styles.budgetHeaderRow}>
                <AppText variant="caption" tone="secondary" style={styles.tileLabel}>
                  Presupuestado
                </AppText>
                <AppText variant="caption" weight="700" style={{ color: palette.primary }}>
                  {formatPercentEs(budgetPercent, 0)} gastado
                </AppText>
              </View>
              <AppText variant="title" weight="800" tabular numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                {formatArs(budgetTotal)}
              </AppText>
              <ProgressBar
                progress={budgetPercent}
                color={palette.primary}
                height={7}
                accessibilityLabel={`Presupuesto usado: ${Math.round(budgetPercent)}%`}
              />
            </PressableScale>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AppText variant="subtitle" weight="700">
                  Últimos movimientos
                </AppText>
                <PressableScale
                  onPress={() => router.navigate('/actividad')}
                  accessibilityRole="button"
                  accessibilityLabel="Ver todos los movimientos"
                  hitSlop={8}
                >
                  <AppText variant="label" tone="accent" weight="600">
                    Ver todos
                  </AppText>
                </PressableScale>
              </View>
              <View>
                {recent.map((movement, index) => (
                  <View key={movement.id}>
                    <MovementRow movement={movement} onPress={() => openMovement(router, movement)} />
                    {index < recent.length - 1 ? (
                      <View style={[styles.divider, { backgroundColor: palette.border }]} />
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </Animated.View>
    </Screen>
  );
}

function DesktopInicio() {
  const { palette } = useAppTheme();
  const router = useRouter();
  const { monthKey, incomeTotal, spentTotal, budgetTotal, budgetPercent, available, movements } = useInicioData();

  const expenses = useExpenseStore((state) => state.expenses);
  const monthExpenses = useMemo(
    () => expenses.filter((expense) => expense.date.startsWith(monthKey)),
    [expenses, monthKey],
  );

  const chartPoints = useMemo(() => {
    const totals = dailyTotals(monthExpenses, monthKey);
    const isCurrentMonth = monthKey === monthKeyOf(new Date());
    const todayDay = Number(todayISO().slice(8, 10));
    const limit = isCurrentMonth ? todayDay : totals.length;
    let cumulative = 0;
    const points: { label: string; value: number }[] = [];
    const [, month] = monthKey.split('-').map(Number);
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    for (let i = 0; i < Math.min(limit, totals.length); i += 1) {
      cumulative += totals[i].total;
      if (i === 0 || i === limit - 1) {
        points.push({ label: `${i + 1} ${monthNames[month - 1]}`, value: cumulative });
      } else if ((i + 1) % 3 === 0) {
        points.push({ label: `${i + 1} ${monthNames[month - 1]}`, value: cumulative });
      } else {
        points.push({ label: '', value: cumulative });
      }
    }
    // Garantizar al menos 2 puntos para la curva.
    if (points.length === 1 && totals.length > 1) {
      points.unshift({ label: '', value: 0 });
    }
    return points;
  }, [monthExpenses, monthKey]);

  const recent = movements.slice(0, 4);

  return (
    <Screen scroll>
      <View style={styles.desktopContent}>
        <View style={styles.desktopHeaderRow}>
          <View style={styles.desktopTitleBlock}>
            <AppText variant="title" weight="800" style={styles.desktopTitle}>
              Tu mes, bajo control.
            </AppText>
            <AppText variant="body" tone="secondary">
              {formatMonthLabel(monthKey)} · Resumen general
            </AppText>
          </View>
          <Button
            label="+ Nuevo movimiento"
            onPress={() => router.navigate('/agregar')}
            style={styles.newMovementButton}
          />
        </View>

        <View style={styles.desktopRow}>
          <AdgHeroCard
            label="DISPONIBLE DEL MES"
            value={available}
            footnote="Ingresos − gastos · Pesos argentinos"
            icon={null}
            style={styles.desktopHero}
          />
          <View style={[styles.desktopStatsCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={styles.desktopStatsRow}>
              <View style={styles.desktopStat}>
                <AppText variant="label" tone="secondary">Ingresos</AppText>
                <AppText variant="subtitle" weight="800" tabular style={{ color: palette.primary }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                  {formatArs(incomeTotal)}
                </AppText>
              </View>
              <View style={styles.desktopStat}>
                <AppText variant="label" tone="secondary">Gastos</AppText>
                <AppText variant="subtitle" weight="800" tabular numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                  {formatArs(spentTotal)}
                </AppText>
              </View>
              <View style={styles.desktopStat}>
                <AppText variant="label" tone="secondary">Presupuestado</AppText>
                <AppText variant="subtitle" weight="800" tabular numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                  {formatArs(budgetTotal)}
                </AppText>
              </View>
            </View>
            <AppText variant="body" tone="secondary" style={styles.desktopPercentRow}>
              {formatPercentEs(budgetPercent, 0)} del presupuesto gastado
            </AppText>
            <ProgressBar progress={budgetPercent} color={palette.primary} height={8} accessibilityLabel="Presupuesto usado" />
          </View>
        </View>

        <View style={styles.desktopRow}>
          <View style={[styles.desktopChartCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <AppText variant="subtitle" weight="700">
              Gastos acumulados
            </AppText>
            <AppText variant="title" weight="800" tabular>
              {formatArs(spentTotal)}
            </AppText>
            <LineChart
              data={chartPoints.map((point) => ({ label: point.label || ' ', value: point.value }))}
              height={210}
              showEndLabels={false}
            />
            <View style={styles.chartAxisRow}>
              <AppText variant="caption" tone="tertiary">{chartPoints[0]?.label ?? ''}</AppText>
              <AppText variant="caption" tone="tertiary">{chartPoints[chartPoints.length - 1]?.label ?? ''}</AppText>
            </View>
          </View>

          <View style={[styles.desktopTableCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <AppText variant="subtitle" weight="700" style={styles.tableTitle}>
              Últimos movimientos
            </AppText>
            <View style={styles.tableHeaderRow}>
              <AppText variant="caption" style={[styles.tableCell, { color: palette.primary }]}>CONCEPTO</AppText>
              <AppText variant="caption" style={[styles.tableCell, styles.tableCellCenter, { color: palette.primary }]}>CATEGORÍA</AppText>
              <AppText variant="caption" style={[styles.tableCell, styles.tableCellRight, { color: palette.primary }]}>MONTO</AppText>
            </View>
            {recent.map((movement) => (
              <PressableScale
                key={movement.id}
                onPress={() => openMovement(router, movement)}
                accessibilityRole="button"
                accessibilityLabel={`${movement.title}, ${formatSignedArs(movement.signedAmount)}`}
                style={styles.tableRow}
              >
                <AppText variant="body" numberOfLines={1} style={styles.tableCell}>
                  {movement.title}
                </AppText>
                <AppText variant="body" tone="secondary" numberOfLines={1} style={[styles.tableCell, styles.tableCellCenter]}>
                  {movement.subtitle}
                </AppText>
                <AppText variant="body" weight="700" tabular numberOfLines={1} style={[styles.tableCell, styles.tableCellRight, { color: palette.primary }]}>
                  {formatSignedArs(movement.signedAmount)}
                </AppText>
              </PressableScale>
            ))}
          </View>
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
  headline: {
    fontSize: 30,
    lineHeight: 35,
  },
  tileRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  tile: {
    flex: 1,
    borderRadius: MOBILE_TILE_RADIUS,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.xs,
    minWidth: 0,
  },
  tileLabel: {
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  budgetCard: {
    borderRadius: MOBILE_TILE_RADIUS,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  budgetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.xs,
    marginLeft: 60,
  },
  movementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  movementIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  movementText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  // ---- escritorio ----
  desktopContent: {
    gap: spacing.xl,
    paddingTop: spacing.xl,
  },
  desktopHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  desktopTitleBlock: {
    gap: spacing.xs,
    flex: 1,
  },
  desktopTitle: {
    fontSize: 32,
    lineHeight: 38,
  },
  newMovementButton: {
    paddingHorizontal: spacing.xxl,
  },
  desktopRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    alignItems: 'stretch',
  },
  desktopHero: {
    flex: 1.35,
    justifyContent: 'center',
    minHeight: 190,
  },
  desktopStatsCard: {
    flex: 1,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.lg,
    justifyContent: 'center',
  },
  desktopStatsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  desktopStat: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  desktopPercentRow: {
    marginBottom: spacing.xs,
  },
  desktopChartCard: {
    flex: 1.15,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.sm,
    minHeight: 300,
  },
  chartAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  desktopTableCard: {
    flex: 1,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    minHeight: 300,
  },
  tableTitle: {
    marginBottom: spacing.md,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  tableCell: {
    flex: 1.2,
  },
  tableCellCenter: {
    flex: 1,
    textAlign: 'center',
  },
  tableCellRight: {
    flex: 1,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2C2C2C',
  },
});
