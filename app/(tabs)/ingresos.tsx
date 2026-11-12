import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AdgHeroCard } from '@/components/AdgHeroCard';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { IncomeList } from '@/components/IncomeList';
import { MonthPill } from '@/components/MonthPill';
import { PressableScale } from '@/components/PressableScale';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { INCOME_SOURCES } from '@/constants/finance';
import { radius, spacing } from '@/constants/layout';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthStore } from '@/store/useMonthStore';
import { formatArs, formatPercentEs } from '@/utils/currency';
import { formatMonthKeyTiny } from '@/utils/date';
import { useMotion } from '@/hooks/useMotion';

export default function IngresosScreen() {
  const { palette } = useAppTheme();
  const router = useRouter();
  const motion = useMotion();

  const monthKey = useMonthStore((state) => state.monthKey);
  const incomes = useFinanceStore((state) => state.incomes);
  const monthIncomes = useMemo(
    () =>
      incomes
        .filter((income) => income.date.startsWith(monthKey))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [incomes, monthKey],
  );

  const total = useMemo(
    () => monthIncomes.reduce((sum, income) => sum + income.amount, 0),
    [monthIncomes],
  );

  const bySource = useMemo(() => {
    const grouped = new Map<string, { amount: number; count: number }>();
    for (const income of monthIncomes) {
      const entry = grouped.get(income.source) ?? { amount: 0, count: 0 };
      entry.amount += income.amount;
      entry.count += 1;
      grouped.set(income.source, entry);
    }
    return [...grouped.entries()]
      .map(([sourceId, data]) => {
        const meta = INCOME_SOURCES.find((source) => source.id === sourceId) ?? INCOME_SOURCES[INCOME_SOURCES.length - 1];
        return {
          sourceId,
          label: meta.label,
          description: meta.description,
          icon: meta.icon,
          amount: data.amount,
          count: data.count,
          share: total > 0 ? (data.amount / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [monthIncomes, total]);

  const monthTin = formatMonthKeyTiny(monthKey).toUpperCase();
  const incomeCount = monthIncomes.length;
  const sourceCount = bySource.length;

  return (
    <Screen scroll>
      <Header title="Ingresos" right={<MonthPill />} />

      <Animated.View entering={motion ? FadeInUp.duration(340) : undefined} key={monthKey} style={styles.content}>
        <AppText variant="title" weight="800" style={styles.headline}>
          Lo que entra,{'\n'}bien claro.
        </AppText>

        <AdgHeroCard
          label={`TOTAL DE INGRESOS · ${monthTin}`}
          value={total}
          footnote={`${incomeCount} ${incomeCount === 1 ? 'ingreso' : 'ingresos'} · ${sourceCount} ${sourceCount === 1 ? 'fuente' : 'fuentes'}`}
          icon={null}
        />

        <View style={styles.sectionHeader}>
          <AppText variant="subtitle" weight="700">
            Tus fuentes de ingreso
          </AppText>
          <PressableScale
            onPress={() => router.navigate('/categorias?tab=ingresos')}
            accessibilityRole="button"
            accessibilityLabel="Ver categorías de ingresos"
            hitSlop={8}
          >
            <AppText variant="label" tone="accent" weight="600">
              Categorías
            </AppText>
          </PressableScale>
        </View>

        {bySource.length > 0 ? (
          <View style={styles.sourceList}>
            {bySource.map((source) => (
              <View key={source.sourceId} style={[styles.sourceCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
                <View style={styles.sourceHeader}>
                  <MaterialCommunityIcons
                    name={source.icon}
                    size={20}
                    color={palette.primary}
                    style={styles.sourceIcon}
                  />
                  <AppText variant="body" weight="700" style={styles.sourceLabel}>
                    {source.label}
                  </AppText>
                  <AppText variant="label" weight="700" tone="accent" tabular>
                    {formatPercentEs(source.share, 0)}
                  </AppText>
                </View>
                <AppText variant="caption" tone="secondary" numberOfLines={1}>
                  {formatArs(source.amount)} · {source.description}
                </AppText>
                <ProgressBar
                  progress={source.share}
                  color={palette.primary}
                  height={6}
                  accessibilityLabel={`${source.label}: ${formatPercentEs(source.share, 0)} del total`}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptySources, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Ionicons name="business-outline" size={22} color={palette.textTertiary} />
            <AppText variant="body" tone="secondary" center>
              Todavía no registraste ingresos este mes.
            </AppText>
          </View>
        )}

        <Button
          label="+ Registrar ingreso"
          onPress={() => router.navigate('/agregar?tipo=ingreso')}
          style={styles.cta}
        />

        {monthIncomes.length > 0 ? (
          <View style={styles.section}>
            <AppText variant="subtitle" weight="700">
              Detalle del mes
            </AppText>
            <IncomeList
              incomes={monthIncomes}
              onEdit={(id) => router.navigate(`/agregar?tipo=ingreso&id=${id}`)}
            />
          </View>
        ) : null}

        <AppText variant="caption" tone="tertiary" center>
          El detalle de tus ingresos está siempre a mano.
        </AppText>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sourceList: {
    gap: spacing.md,
  },
  sourceCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sourceIcon: {
    marginRight: 2,
  },
  sourceLabel: {
    flex: 1,
  },
  emptySources: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  cta: {
    minHeight: 56,
  },
});
