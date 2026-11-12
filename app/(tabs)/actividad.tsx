import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { MonthPill } from '@/components/MonthPill';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthStore } from '@/store/useMonthStore';
import {
  DEFAULT_MOVEMENT_FILTER,
  useMovementFilterStore,
} from '@/store/useMovementFilterStore';
import { buildMovements, filterMovements, type Movement } from '@/utils/movements';
import { formatArsSpaced, formatSignedArs } from '@/utils/currency';
import { formatMonthLabel, formatRelativeDay } from '@/utils/date';
import { useMotion } from '@/hooks/useMotion';
import type { IconName } from '@/types';
import { alpha } from '@/utils/color';

type Chip = 'todos' | 'ingresos' | 'gastos';

const CHIPS: { value: Chip; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'ingresos', label: 'Ingresos' },
  { value: 'gastos', label: 'Gastos' },
];

function MovementItem({ movement, onPress }: { movement: Movement; onPress: () => void }) {
  const { palette, isDark } = useAppTheme();
  const positive = movement.signedAmount >= 0;
  const tint = movement.kind === 'ingreso' ? palette.primary : movement.color;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${movement.title}, ${formatSignedArs(movement.signedAmount)}`}
      style={styles.item}
    >
      <View
        style={[
          styles.icon,
          { backgroundColor: alpha(tint, isDark ? 0.22 : 0.14) },
        ]}
      >
        <MaterialCommunityIcons
          name={movement.icon as IconName}
          size={20}
          color={tint}
        />
      </View>
      <View style={styles.itemText}>
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

export default function ActividadScreen() {
  const { palette } = useAppTheme();
  const router = useRouter();
  const motion = useMotion();

  const monthKey = useMonthStore((state) => state.monthKey);
  const expenses = useExpenseStore((state) => state.expenses);
  const categories = useFinanceStore((state) => state.categories);
  const incomes = useFinanceStore((state) => state.incomes);

  const filter = useMovementFilterStore();
  const [query, setQuery] = useState('');

  // Los chips sincronizan con el filtro compartido (la pantalla Filtros lo edita completo).
  const chip: Chip = filter.tipo;
  const setChip = (value: Chip) => filter.setFilter({ tipo: value });

  const allMovements = useMemo(
    () => buildMovements(expenses, incomes, categories),
    [expenses, incomes, categories],
  );

  const visible = useMemo(
    () => filterMovements(allMovements, monthKey, filter, query),
    [allMovements, monthKey, filter, query],
  );

  const expensesInView = useMemo(
    () => visible.filter((movement) => movement.kind === 'gasto'),
    [visible],
  );
  const incomesInView = useMemo(
    () => visible.filter((movement) => movement.kind === 'ingreso'),
    [visible],
  );
  const net = useMemo(
    () => visible.reduce((sum, movement) => sum + movement.signedAmount, 0),
    [visible],
  );
  const spent = useMemo(
    () => expensesInView.reduce((sum, movement) => sum + movement.absoluteAmount, 0),
    [expensesInView],
  );

  const summaryLine = (() => {
    if (chip === 'gastos') {
      return `${expensesInView.length} ${expensesInView.length === 1 ? 'gasto' : 'gastos'} · − ${formatArsSpaced(spent)} en gastos`;
    }
    if (chip === 'ingresos') {
      const incomeTotal = incomesInView.reduce((sum, movement) => sum + movement.absoluteAmount, 0);
      return `${incomesInView.length} ${incomesInView.length === 1 ? 'ingreso' : 'ingresos'} · + ${formatArsSpaced(incomeTotal)}`;
    }
    return `${visible.length} ${visible.length === 1 ? 'movimiento' : 'movimientos'} · ${net >= 0 ? '+' : '−'} ${formatArsSpaced(Math.abs(net))} neto`;
  })();

  const isDefaultFilter =
    filter.tipo === DEFAULT_MOVEMENT_FILTER.tipo &&
    filter.categoryId === null &&
    filter.paymentMethod === null &&
    filter.period === 'mes' &&
    filter.sort === 'recientes';

  const openMovement = (movement: Movement) => {
    if (movement.kind === 'gasto') {
      router.navigate(`/expense/${movement.id}`);
    } else {
      router.navigate(`/agregar?tipo=ingreso&id=${movement.id}`);
    }
  };

  const hasActiveScope = !isDefaultFilter || query.trim() !== '';

  return (
    <Screen scroll keyboardAware>
      <Header title="Actividad" right={<MonthPill />} />

      <Animated.View entering={motion ? FadeIn.duration(260) : undefined} key={monthKey} style={styles.content}>
        <View style={styles.headlineRow}>
          <AppText variant="title" weight="800" style={styles.headline}>
            Cada movimiento cuenta.
          </AppText>
        </View>

        <View style={[styles.searchBox, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Ionicons name="search-outline" size={18} color={palette.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar movimiento"
            placeholderTextColor={palette.textTertiary}
            returnKeyType="search"
            accessibilityLabel="Buscar movimiento"
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

        <View style={styles.chipsRow}>
          <View style={styles.chips}>
            {CHIPS.map((option) => {
              const active = option.value === chip;
              return (
                <PressableScale
                  key={option.value}
                  onPress={() => setChip(option.value)}
                  scaleTo={0.94}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={option.label}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? palette.primary : palette.card,
                      borderColor: active ? palette.primary : palette.border,
                    },
                  ]}
                >
                  <AppText
                    variant="label"
                    weight="600"
                    style={{ color: active ? palette.onPrimary : palette.textSecondary }}
                  >
                    {option.label}
                  </AppText>
                </PressableScale>
              );
            })}
          </View>
          <PressableScale
            onPress={() => router.navigate('/filtros')}
            scaleTo={0.9}
            pressedOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel="Abrir filtros"
            hitSlop={8}
            style={styles.gearButton}
          >
            <Ionicons name="settings-outline" size={22} color={palette.textSecondary} />
          </PressableScale>
        </View>

        <View style={styles.sectionHeaderBlock}>
          <AppText variant="caption" weight="700" tone="accent" style={styles.monthCaption}>
            {formatMonthLabel(monthKey).toUpperCase()}
          </AppText>
          <AppText variant="label" tone="secondary">
            {summaryLine}
          </AppText>
        </View>

        {visible.length > 0 ? (
          <View style={styles.list}>
            {visible.map((movement, index) => (
              <View key={movement.id}>
                <MovementItem movement={movement} onPress={() => openMovement(movement)} />
                {index < visible.length - 1 ? (
                  <View style={[styles.divider, { backgroundColor: palette.border }]} />
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            icon={hasActiveScope ? 'filter-outline' : 'wallet-outline'}
            title={hasActiveScope ? 'No hay movimientos que coincidan' : 'Todavía no hay movimientos'}
            message={
              hasActiveScope
                ? 'Probá con otro mes, categoría, medio de pago o término de búsqueda.'
                : 'Agregá tu primer movimiento para empezar a controlar.'
            }
          />
        )}

        <PressableScale
          onPress={() => router.navigate('/historial')}
          accessibilityRole="button"
          accessibilityLabel="Ver historial completo"
          style={styles.historyLink}
          hitSlop={8}
        >
          <AppText variant="label" tone="accent" center>
            Ver historial completo
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
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headline: {
    flex: 1,
    fontSize: 28,
    lineHeight: 33,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    minHeight: 48,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    padding: 0,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chips: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    height: 38,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderBlock: {
    gap: 2,
    marginTop: spacing.xs,
  },
  monthCaption: {
    letterSpacing: 1.2,
    fontSize: 11,
  },
  list: {
    gap: 0,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60,
  },
  historyLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
});
