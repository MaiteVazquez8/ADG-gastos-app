import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { INCOME_SOURCES } from '@/constants/finance';
import { radius, spacing } from '@/constants/layout';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthStore } from '@/store/useMonthStore';
import type { FinanceCategory } from '@/types';
import { formatArs } from '@/utils/currency';
import { useMotion } from '@/hooks/useMotion';
import { alpha } from '@/utils/color';

type Tab = 'gastos' | 'ingresos';

function categoryType(category: FinanceCategory): 'gasto' | 'ingreso' {
  return category.type ?? 'gasto';
}

export default function CategoriasScreen() {
  const { palette, isDark } = useAppTheme();
  const router = useRouter();
  const motion = useMotion();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const activeTab: Tab = tab === 'ingresos' ? 'ingresos' : 'gastos';

  const monthKey = useMonthStore((state) => state.monthKey);
  const categories = useFinanceStore((state) => state.categories);
  const expenses = useExpenseStore((state) => state.expenses);

  const expenseCategories = useMemo(
    () => categories.filter((category) => categoryType(category) === 'gasto'),
    [categories],
  );
  const customIncomeCategories = useMemo(
    () => categories.filter((category) => categoryType(category) === 'ingreso'),
    [categories],
  );

  const monthExpenses = useMemo(
    () => expenses.filter((expense) => expense.date.startsWith(monthKey)),
    [expenses, monthKey],
  );

  const statsByCategory = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    for (const expense of monthExpenses) {
      const entry = map.get(expense.category) ?? { count: 0, total: 0 };
      entry.count += 1;
      entry.total += expense.amount;
      map.set(expense.category, entry);
    }
    return map;
  }, [monthExpenses]);

  const setTab = (next: Tab) => {
    router.setParams({ tab: next });
  };

  const headerTitle = activeTab === 'ingresos' ? 'Categorías de ingresos' : 'Categorías';
  const headline = activeTab === 'ingresos' ? 'Tus ingresos, organizados.' : 'Un lugar para cada gasto.';

  return (
    <Screen scroll>
      <Header title={headerTitle} />

      <Animated.View entering={motion ? FadeInUp.duration(340) : undefined} key={activeTab} style={styles.content}>
        <AppText variant="title" weight="800" style={styles.headline}>
          {headline}
        </AppText>

        <View style={styles.segment} accessibilityRole="tablist">
          {(['gastos', 'ingresos'] as const).map((option) => {
            const active = option === activeTab;
            return (
              <PressableScale
                key={option}
                onPress={() => setTab(option)}
                scaleTo={0.94}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={option === 'gastos' ? 'Gastos' : 'Ingresos'}
                style={[
                  styles.segmentOption,
                  { backgroundColor: active ? palette.primary : palette.card },
                ]}
              >
                <AppText
                  variant="label"
                  weight="700"
                  style={{ color: active ? palette.onPrimary : palette.textSecondary }}
                >
                  {option === 'gastos' ? 'Gastos' : 'Ingresos'}
                </AppText>
              </PressableScale>
            );
          })}
        </View>

        {activeTab === 'gastos' ? (
          <>
            <View style={styles.list}>
              {expenseCategories.map((category) => {
                const stats = statsByCategory.get(category.id) ?? { count: 0, total: 0 };
                return (
                  <PressableScale
                    key={category.id}
                    onPress={() => router.navigate(`/categoria?editId=${category.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`${category.name}, ${stats.count} movimientos, ${formatArs(stats.total)}`}
                    style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}
                  >
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: alpha(category.color, isDark ? 0.22 : 0.14) },
                      ]}
                    >
                      <MaterialCommunityIcons name={category.icon} size={22} color={category.color} />
                    </View>
                    <View style={styles.rowText}>
                      <AppText variant="body" weight="600" numberOfLines={1}>
                        {category.name}
                      </AppText>
                      <AppText variant="caption" tone="tertiary" numberOfLines={1}>
                        {stats.count} {stats.count === 1 ? 'movimiento' : 'movimientos'} · {formatArs(stats.total)}
                      </AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={palette.textTertiary} />
                  </PressableScale>
                );
              })}
            </View>

            <Button
              label="+ Nueva categoría"
              onPress={() => router.navigate('/categoria?tipo=gasto')}
              style={styles.cta}
            />
            <AppText variant="caption" tone="tertiary" center>
              Organizá categorías y definí sus límites.
            </AppText>
          </>
        ) : (
          <>
            <View style={styles.list}>
              {INCOME_SOURCES.map((source) => (
                <PressableScale
                  key={source.id}
                  onPress={() => router.navigate(`/agregar?tipo=ingreso&fuente=${source.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`${source.label}. ${source.description}`}
                  style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}
                >
                  <View style={[styles.iconCircle, { backgroundColor: alpha(palette.primary, isDark ? 0.22 : 0.12) }]}>
                    <MaterialCommunityIcons name={source.icon} size={22} color={palette.primary} />
                  </View>
                  <View style={styles.rowText}>
                    <AppText variant="body" weight="600" numberOfLines={1}>
                      {source.label}
                    </AppText>
                    <AppText variant="caption" tone="tertiary" numberOfLines={1}>
                      {source.description}
                    </AppText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={palette.textTertiary} />
                </PressableScale>
              ))}
              {customIncomeCategories.map((category) => (
                <PressableScale
                  key={category.id}
                  onPress={() => router.navigate(`/categoria?editId=${category.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Editar ${category.name}`}
                  style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}
                >
                  <View style={[styles.iconCircle, { backgroundColor: alpha(category.color, isDark ? 0.22 : 0.12) }]}>
                    <MaterialCommunityIcons name={category.icon} size={22} color={category.color} />
                  </View>
                  <View style={styles.rowText}>
                    <AppText variant="body" weight="600" numberOfLines={1}>
                      {category.name}
                    </AppText>
                    <AppText variant="caption" tone="tertiary" numberOfLines={1}>
                      Categoría personalizada
                    </AppText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={palette.textTertiary} />
                </PressableScale>
              ))}
            </View>

            <Button
              label="+ Nueva categoría"
              onPress={() => router.navigate('/categoria?tipo=ingreso')}
              style={styles.cta}
            />
            <Pressable onPress={() => router.navigate('/ingresos')} accessibilityRole="button" accessibilityLabel="Volver a ingresos">
              <View style={[styles.secondaryButton, { backgroundColor: palette.card, borderColor: palette.border }]}>
                <AppText variant="button" weight="600">
                  Volver a ingresos
                </AppText>
              </View>
            </Pressable>
          </>
        )}
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
  segment: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    gap: spacing.sm,
  },
  segmentOption: {
    height: 40,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  cta: {
    minHeight: 56,
    marginTop: spacing.xs,
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
});
