import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Button } from '@/components/Button';
import { GroupedBarChart } from '@/components/GroupedBarChart';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthStore } from '@/store/useMonthStore';
import { formatArs, formatPercentEs, formatThousandsOnly } from '@/utils/currency';
import { addMonths, formatMonthLabel, monthKeyOf, monthKeyStartDate } from '@/utils/date';
import { useMotion } from '@/hooks/useMotion';

export default function ComparacionScreen() {
  const { palette } = useAppTheme();
  const router = useRouter();
  const motion = useMotion();

  const monthKey = useMonthStore((state) => state.monthKey);
  const expenses = useExpenseStore((state) => state.expenses);
  const incomes = useFinanceStore((state) => state.incomes);

  const previousMonthKey = monthKeyOf(addMonths(monthKeyStartDate(monthKey), -1));

  const totals = useMemo(() => {
    const sumFor = (key: string, list: { amount: number; date: string }[]) =>
      list.filter((entry) => entry.date.startsWith(key)).reduce((sum, entry) => sum + entry.amount, 0);
    const prevExpenses = sumFor(previousMonthKey, expenses);
    const currExpenses = sumFor(monthKey, expenses);
    const prevIncome = sumFor(previousMonthKey, incomes);
    const currIncome = sumFor(monthKey, incomes);
    return {
      prevIncome,
      currIncome,
      prevExpenses,
      currExpenses,
      prevAvailable: prevIncome - prevExpenses,
      currAvailable: currIncome - currExpenses,
    };
  }, [expenses, incomes, monthKey, previousMonthKey]);

  const prevLabel = formatMonthLabel(previousMonthKey);
  const currLabel = formatMonthLabel(monthKey);
  const spendDelta = totals.prevExpenses - totals.currExpenses;
  const spendDeltaPercent =
    totals.prevExpenses > 0 ? (spendDelta / totals.prevExpenses) * 100 : null;
  const savedMore = spendDelta >= 0;

  const isCurrentMonth = monthKey === monthKeyOf(new Date());
  const prevMonthShort = prevLabel.toLowerCase();
  const currMonthShort = currLabel.toLowerCase();

  const entering = motion ? FadeInUp.duration(340) : undefined;

  return (
    <Screen scroll>
      <Header title="Comparación" />

      <Animated.View entering={entering} key={monthKey} style={styles.content}>
        <AppText variant="title" weight="800" style={styles.headline}>
          Compará. Ajustá. Avanzá.
        </AppText>
        <AppText variant="body" tone="secondary">
          {prevLabel} vs. {currLabel}
        </AppText>
        <AppText variant="caption" tone="tertiary" style={styles.unitNote}>
          Montos en miles de ARS
        </AppText>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSquare, { backgroundColor: '#FFFFFF' }]} />
            <AppText variant="caption" tone="secondary">
              {prevLabel}
            </AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSquare, { backgroundColor: palette.primary }]} />
            <AppText variant="caption" tone="secondary">
              {currLabel}
            </AppText>
          </View>
        </View>

        <View style={[styles.chartCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <GroupedBarChart
            groups={[
              { label: 'Ingresos', previous: totals.prevIncome, current: totals.currIncome },
              { label: 'Gastos', previous: totals.prevExpenses, current: totals.currExpenses },
              { label: 'Disponible', previous: Math.max(totals.prevAvailable, 0), current: Math.max(totals.currAvailable, 0) },
            ]}
            height={200}
            formatValue={(value) => formatThousandsOnly(value / 1000)}
          />
        </View>

        <View style={[styles.verdictCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          {spendDeltaPercent !== null ? (
            <>
              <AppText variant="subtitle" weight="800">
                Gastaste{' '}
                <AppText variant="subtitle" weight="800" style={{ color: savedMore ? palette.primary : palette.danger }}>
                  {formatArs(Math.abs(spendDelta))} {savedMore ? 'menos' : 'más'}
                </AppText>
              </AppText>
              <AppText variant="label" style={{ color: savedMore ? palette.primary : palette.danger }}>
                {savedMore ? '−' : '+'}{formatPercentEs(Math.abs(spendDeltaPercent))} frente al mes anterior
              </AppText>
            </>
          ) : (
            <AppText variant="subtitle" weight="700">
              Sin gastos en {prevLabel.toLowerCase()} para comparar.
            </AppText>
          )}
        </View>

        <AppText variant="caption" tone="tertiary" style={styles.footnote}>
          {isCurrentMonth
            ? `${prevLabel} completo vs. ${currMonthShort} al día de hoy. La comparación es parcial: el mes sigue en curso.`
            : `${prevMonthShort} completo vs. ${currMonthShort} completo.`}
        </AppText>

        <Button
          label="Volver a estadísticas"
          variant="secondary"
          onPress={() => router.navigate('/analisis')}
        />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  headline: {
    fontSize: 30,
    lineHeight: 36,
  },
  unitNote: {
    marginTop: -spacing.xs,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  chartCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    paddingBottom: spacing.md,
    marginTop: spacing.sm,
  },
  verdictCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  footnote: {
    marginTop: spacing.xs,
    lineHeight: 18,
  },
});
