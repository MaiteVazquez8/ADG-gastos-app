import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ExpenseCard } from '@/components/ExpenseCard';
import { FilterTabs, type FilterTabOption } from '@/components/FilterTabs';
import { Header } from '@/components/Header';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import {
  filterByCategory,
  filterByMonth,
  filterByNote,
  groupByDay,
  sumTotal,
} from '@/utils/aggregation';
import { formatCurrency } from '@/utils/currency';
import {
  addMonths,
  formatMonthLabel,
  formatRelativeDay,
  monthKeyOf,
  monthKeyStartDate,
} from '@/utils/date';

type CategoryFilter = string | 'all';

export default function HistoryScreen() {
  const { palette } = useAppTheme();
  const router = useRouter();
  const expenses = useExpenseStore((state) => state.expenses);
  const categories = useFinanceStore((state) => state.categories);

  const [monthKey, setMonthKey] = useState<string>(() => monthKeyOf(new Date()));
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState<string>('');

  const currentMonthKey = monthKeyOf(new Date());

  const categoryOptions = useMemo<readonly FilterTabOption<CategoryFilter>[]>(
    () => [
      { label: 'Todas', value: 'all' },
      ...categories.map((c) => ({ label: c.name, value: c.id as CategoryFilter })),
    ],
    [categories],
  );

  const visible = useMemo(() => {
    const byMonth = filterByMonth(expenses, monthKey);
    const byCategory = filterByCategory(byMonth, category === 'all' ? null : category);
    const byNote = filterByNote(byCategory, query);
    return byNote;
  }, [expenses, monthKey, category, query]);

  const sorted = useMemo(() => {
    return [...visible].sort((a, b) => {
      const byDate = b.date.localeCompare(a.date);
      if (byDate !== 0) return byDate;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [visible]);

  const groups = useMemo(() => groupByDay(sorted), [sorted]);
  const filteredTotal = useMemo(() => sumTotal(sorted), [sorted]);

  const goToMonth = (offset: number) => {
    setMonthKey(monthKeyOf(addMonths(monthKeyStartDate(monthKey), offset)));
  };

  const hasAnyExpenses = expenses.length > 0;

  return (
    <Screen scroll keyboardAware>
      <Header title="Historial" showBack />

      <View style={styles.content}>
        <View style={styles.monthNavigator}>
          <PressableScale
            onPress={() => goToMonth(-1)}
            style={[
              styles.monthArrow,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Mes anterior"
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={18} color={palette.textPrimary} />
          </PressableScale>

          <View style={styles.monthCenter}>
            <AppText variant="subtitle" center numberOfLines={1}>
              {formatMonthLabel(monthKey)}
            </AppText>
            {monthKey !== currentMonthKey ? (
              <PressableScale
                onPress={() => setMonthKey(currentMonthKey)}
                accessibilityRole="button"
                accessibilityLabel="Ir al mes actual"
                hitSlop={8}
              >
                <AppText variant="caption" tone="accent" center>
                  Volver al mes actual
                </AppText>
              </PressableScale>
            ) : null}
          </View>

          <PressableScale
            onPress={() => goToMonth(1)}
            style={[
              styles.monthArrow,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Mes siguiente"
            hitSlop={8}
          >
            <Ionicons name="chevron-forward" size={18} color={palette.textPrimary} />
          </PressableScale>
        </View>

        <View
          style={[
            styles.searchBox,
            { backgroundColor: palette.card, borderColor: palette.border },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={palette.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por descripción"
            placeholderTextColor={palette.textTertiary}
            returnKeyType="search"
            accessibilityLabel="Buscar por descripción"
            style={[styles.searchInput, { color: palette.textPrimary }]}
          />
          {query.length > 0 ? (
            <PressableScale
              onPress={() => setQuery('')}
              scaleTo={0.9}
              pressedOpacity={0.5}
              accessibilityRole="button"
              accessibilityLabel="Limpiar búsqueda"
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={18} color={palette.textTertiary} />
            </PressableScale>
          ) : null}
        </View>

        <FilterTabs<CategoryFilter>
          options={categoryOptions}
          selected={category}
          onSelect={setCategory}
        />

        <Animated.View key={`${monthKey}|${category}`} entering={FadeIn.duration(240)}>
          {hasAnyExpenses && sorted.length > 0 ? (
            <>
              <AppText variant="caption" tone="tertiary" tabular>
                {sorted.length} {sorted.length === 1 ? 'gasto' : 'gastos'} ·{' '}
                {formatCurrency(filteredTotal)}
              </AppText>

              <View style={styles.groups}>
                {groups.map((group) => (
                  <View key={group.date} style={styles.group}>
                    <View style={styles.groupHeader}>
                      <AppText variant="label" tone="secondary">
                        {formatRelativeDay(group.date)}
                      </AppText>
                      <AppText variant="label" tone="tertiary" tabular>
                        {formatCurrency(group.total)}
                      </AppText>
                    </View>
                    <View style={styles.list}>
                      {group.items.map((expense, index) => (
                        <ExpenseCard
                          key={expense.id}
                          expense={expense}
                          index={index}
                          onPress={() => router.push(`/expense/${expense.id}`)}
                        />
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <EmptyState
              icon={hasAnyExpenses ? 'filter-outline' : 'wallet-outline'}
              title={hasAnyExpenses ? 'No hay gastos que coincidan' : 'Todavía no hay gastos'}
              message={
                hasAnyExpenses
                  ? 'Probá con otro mes, categoría o término de búsqueda.'
                  : 'Agregá tu primer gasto para empezar a controlar.'
              }
              action={
                !hasAnyExpenses ? (
                  <Button
                    label="Agregar gasto"
                    onPress={() => router.push({ pathname: '/add-expense', params: { month: monthKey } })}
                  />
                ) : undefined
              }
            />
          )}
      </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  monthNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  monthArrow: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCenter: {
    flex: 1,
    gap: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    padding: 0,
  },
  groups: {
    gap: spacing.xl,
  },
  group: {
    gap: spacing.sm,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  list: {
    gap: spacing.sm,
  },
});