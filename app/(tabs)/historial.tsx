import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Header } from '@/components/Header';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { SelectSheet } from '@/components/SelectSheet';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthStore } from '@/store/useMonthStore';
import { buildMovements } from '@/utils/movements';
import { formatArs } from '@/utils/currency';
import { formatMonthLabel, monthKeyOf } from '@/utils/date';
import { useMotion } from '@/hooks/useMotion';

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function HistorialScreen() {
  const { palette } = useAppTheme();
  const router = useRouter();
  const motion = useMotion();

  const monthKey = useMonthStore((state) => state.monthKey);
  const setMonthKey = useMonthStore((state) => state.setMonthKey);
  const expenses = useExpenseStore((state) => state.expenses);
  const incomes = useFinanceStore((state) => state.incomes);
  const categories = useFinanceStore((state) => state.categories);

  const [year, setYear] = useState<number>(() => Number(monthKey.slice(0, 4)));
  const [yearPickerOpen, setYearPickerOpen] = useState(false);

  // Si el usuario cambia de mes en otra pantalla, el año sigue (ajuste derivado en render).
  const monthYear = Number(monthKey.slice(0, 4));
  const [prevMonthYear, setPrevMonthYear] = useState(monthYear);
  if (monthYear !== prevMonthYear) {
    setPrevMonthYear(monthYear);
    setYear(monthYear);
  }

  const currentMonthKey = monthKeyOf(new Date());

  const yearMonths = useMemo(() => {
    const list: string[] = [];
    for (let month = 1; month <= 12; month += 1) {
      list.push(`${year}-${String(month).padStart(2, '0')}`);
    }
    return list;
  }, [year]);

  const rows = useMemo(() => {
    const movements = buildMovements(expenses, incomes, categories);
    // Ordenados del más reciente al más antiguo.
    return [...yearMonths]
      .sort((a, b) => b.localeCompare(a))
      .map((key) => {
        const monthMovements = movements.filter((movement) => movement.date.startsWith(key));
        const spent = monthMovements
          .filter((movement) => movement.kind === 'gasto')
          .reduce((sum, movement) => sum + movement.absoluteAmount, 0);
        const count = monthMovements.length;
        return {
          key,
          label: formatMonthLabel(key).split(' ')[0],
          spent,
          count,
          isCurrent: key === currentMonthKey,
          status: key === currentMonthKey ? 'En curso' : 'Cerrado',
        };
      })
      .filter((row) => row.count > 0)
      .slice(0, 4);
  }, [yearMonths, expenses, incomes, categories, currentMonthKey]);

  const threeMonthTotal = useMemo(() => {
    // Últimos 3 meses calendario (el actual y los 2 anteriores), como el mock.
    const anchor = new Date();
    let total = 0;
    for (let i = 0; i < 3; i += 1) {
      const date = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      total += expenses
        .filter((expense) => expense.date.startsWith(key))
        .reduce((sum, expense) => sum + expense.amount, 0);
    }
    return total;
  }, [expenses]);

  const years = useMemo(() => {
    const set = new Set<number>([Number(currentMonthKey.slice(0, 4)), 2026, 2025, 2024]);
    for (const expense of expenses) {
      set.add(Number(expense.date.slice(0, 4)));
    }
    for (const income of incomes) {
      set.add(Number(income.date.slice(0, 4)));
    }
    return [...set].sort((a, b) => b - a);
  }, [expenses, incomes, currentMonthKey]);

  const openMonth = (key: string) => {
    setMonthKey(key);
    router.navigate('/actividad');
  };

  const exportCsv = () => {
    router.navigate('/carga-resumen?modo=historial');
  };

  const entering = motion ? FadeInUp.duration(340) : undefined;

  return (
    <Screen scroll>
      <Header
        title="Historial"
        right={
          <PressableScale
            onPress={exportCsv}
            scaleTo={0.9}
            pressedOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel="Exportar historial en CSV"
            hitSlop={8}
            style={styles.downloadButton}
          >
            <Ionicons name="download-outline" size={24} color={palette.primary} />
          </PressableScale>
        }
      />

      <Animated.View entering={entering} key={year} style={styles.content}>
        <AppText variant="title" weight="800" style={styles.headline}>
          Tu recorrido,{'\n'}en orden.
        </AppText>

        <View style={styles.yearRow}>
          <PressableScale
            onPress={() => setYearPickerOpen(true)}
            scaleTo={0.94}
            accessibilityRole="button"
            accessibilityLabel={`Año ${year}. Tocar para cambiar`}
            style={[styles.yearPill, { backgroundColor: palette.primary }]}
          >
            <AppText variant="label" weight="700" style={{ color: palette.onPrimary }}>
              {year}
            </AppText>
            <Ionicons name="chevron-down" size={14} color={palette.onPrimary} />
          </PressableScale>
        </View>

        <View style={styles.monthList}>
          {rows.map((row) => (
            <View key={row.key} style={[styles.monthCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <View style={styles.monthHeader}>
                <AppText variant="subtitle" weight="700" style={styles.monthName}>
                  {capitalize(row.label)}
                </AppText>
                <AppText variant="subtitle" weight="800" tabular style={{ color: palette.primary }}>
                  − {formatArs(row.spent)}
                </AppText>
              </View>
              <AppText variant="caption" tone="secondary">
                {row.status} · {row.count} {row.count === 1 ? 'movimiento' : 'movimientos'}
              </AppText>
              <PressableScale
                onPress={() => openMonth(row.key)}
                accessibilityRole="button"
                accessibilityLabel={`Ver movimientos de ${row.label}`}
                hitSlop={6}
                style={styles.monthLink}
              >
                <AppText variant="label" tone="accent" weight="600">
                  Ver movimientos ›
                </AppText>
              </PressableScale>
            </View>
          ))}
          {rows.length === 0 ? (
            <AppText variant="body" tone="secondary" center style={styles.emptyYear}>
              No hay movimientos registrados en {year}.
            </AppText>
          ) : null}
        </View>

        <View style={[styles.totalCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <AppText variant="label" tone="secondary">
            Gastos de los últimos 3 meses
          </AppText>
          <AppText variant="title" weight="800" tabular>
            {formatArs(threeMonthTotal)}
          </AppText>
        </View>

        <PressableScale
          onPress={exportCsv}
          accessibilityRole="button"
          accessibilityLabel="Exportar historial en CSV"
          style={styles.exportLink}
          hitSlop={8}
        >
          <AppText variant="label" tone="accent" center>
            Exportar historial en CSV
          </AppText>
        </PressableScale>
      </Animated.View>

      <SelectSheet
        visible={yearPickerOpen}
        title="Elegí un año"
        options={years.map((y) => ({ value: String(y), label: String(y) }))}
        selectedValue={String(year)}
        onSelect={(value) => setYear(Number(value))}
        onClose={() => setYearPickerOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  downloadButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontSize: 30,
    lineHeight: 36,
  },
  yearRow: {
    flexDirection: 'row',
  },
  yearPill: {
    height: 34,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  monthList: {
    gap: spacing.md,
  },
  monthCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  monthName: {
    flex: 1,
  },
  monthLink: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  emptyYear: {
    paddingVertical: spacing.xxl,
  },
  totalCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  exportLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
});
