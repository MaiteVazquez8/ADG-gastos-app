import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Header } from '@/components/Header';
import { MonthPill } from '@/components/MonthPill';
import { PressableScale } from '@/components/PressableScale';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthStore } from '@/store/useMonthStore';
import { buildLimitRows, monthLimitSummary } from '@/utils/budgetLimits';
import { formatArs, formatPercentEs } from '@/utils/currency';
import { useMotion } from '@/hooks/useMotion';

export default function PresupuestosScreen() {
  const { palette } = useAppTheme();
  const router = useRouter();
  const motion = useMotion();

  const monthKey = useMonthStore((state) => state.monthKey);
  const categories = useFinanceStore((state) => state.categories);
  const expenses = useExpenseStore((state) => state.expenses);
  const limitsByMonth = useBudgetStore((state) => state.limitsByMonth);

  const monthExpenses = useMemo(
    () => expenses.filter((expense) => expense.date.startsWith(monthKey)),
    [expenses, monthKey],
  );

  const rows = useMemo(
    () => buildLimitRows(categories, monthExpenses, limitsByMonth, monthKey),
    [categories, monthExpenses, limitsByMonth, monthKey],
  );
  const summary = useMemo(
    () => monthLimitSummary(categories, monthExpenses, limitsByMonth, monthKey),
    [categories, monthExpenses, limitsByMonth, monthKey],
  );

  const entering = motion ? FadeInUp.duration(340) : undefined;

  return (
    <Screen scroll>
      <Header title="Presupuestos" right={<MonthPill />} />

      <Animated.View entering={entering} key={monthKey} style={styles.content}>
        <AppText variant="title" weight="800" style={styles.headline}>
          Dale un plan{'\n'}a tu mes.
        </AppText>

        <View style={[styles.summaryCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <AppText variant="label" tone="secondary">
            Gastado / presupuestado
          </AppText>
          <View style={styles.summaryRow}>
            <View style={styles.summaryMain}>
              <AppText variant="title" weight="800" tabular numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                {formatArs(summary.spent)}
              </AppText>
              <AppText variant="label" tone="tertiary">
                de {formatArs(summary.total)}
              </AppText>
            </View>
            <AppText variant="hero" weight="800" style={{ color: palette.primary }}>
              {formatPercentEs(summary.percent, 0)}
            </AppText>
          </View>
          <ProgressBar progress={summary.percent} color={palette.primary} height={7} accessibilityLabel="Presupuesto usado" />
        </View>

        <View style={styles.sectionHeader}>
          <AppText variant="subtitle" weight="700">
            Límites por categoría
          </AppText>
          <PressableScale
            onPress={() => router.navigate('/editar-limite')}
            accessibilityRole="button"
            accessibilityLabel="Editar límites por categoría"
            hitSlop={8}
          >
            <AppText variant="label" tone="accent" weight="600">
              Editar
            </AppText>
          </PressableScale>
        </View>

        <View style={styles.limitList}>
          {rows.map((row) => {
            const capped = Math.min(row.percent, 100);
            const over = row.percent >= 100;
            return (
              <PressableScale
                key={row.categoryId}
                onPress={() => router.navigate(`/editar-limite?categoria=${row.categoryId}`)}
                accessibilityRole="button"
                accessibilityLabel={`${row.name}: ${formatArs(row.spent)} de ${formatArs(row.limit)}, ${formatPercentEs(row.percent, 0)}`}
                style={styles.limitRow}
              >
                <View style={styles.limitHeader}>
                  <MaterialCommunityIcons
                    name={row.icon}
                    size={18}
                    color={row.color}
                    style={styles.limitIcon}
                  />
                  <AppText variant="body" weight="600" numberOfLines={1} style={styles.limitName}>
                    {row.name}
                  </AppText>
                  <AppText
                    variant="label"
                    weight="700"
                    tabular
                    style={{ color: over ? palette.danger : palette.primary }}
                  >
                    {row.limit > 0 ? formatPercentEs(row.percent, 0) : 'Sin límite'}
                  </AppText>
                </View>
                <AppText variant="caption" tone="tertiary" tabular>
                  {formatArs(row.spent)} de {row.limit > 0 ? formatArs(row.limit) : '∞'}
                </AppText>
                <ProgressBar
                  progress={row.limit > 0 ? capped : 0}
                  color={over ? palette.danger : palette.primary}
                  height={6}
                  accessibilityLabel={`${row.name}: ${Math.round(row.percent)}% usado`}
                />
              </PressableScale>
            );
          })}
        </View>

        <PressableScale
          onPress={() => router.navigate('/distribucion')}
          accessibilityRole="button"
          accessibilityLabel="Distribución de ingresos por porcentaje"
          style={styles.distributionLink}
          hitSlop={8}
        >
          <AppText variant="label" tone="tertiary" center>
            Presupuesto por porcentaje del ingreso ›
          </AppText>
        </PressableScale>
      </Animated.View>
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
    lineHeight: 36,
  },
  summaryCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  summaryMain: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  limitList: {
    gap: spacing.md,
  },
  limitRow: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  limitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  limitIcon: {
    marginRight: 2,
  },
  limitName: {
    flex: 1,
  },
  distributionLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
});
