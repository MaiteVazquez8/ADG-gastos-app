import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { PressableScale } from '@/components/PressableScale';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import { useMonthStore } from '@/store/useMonthStore';
import { addMonths, formatMonthLabel, monthKeyOf, monthKeyStartDate } from '@/utils/date';

/**
 * Shared month switcher used by the Presupuesto and Gastos tabs. Both screens
 * read the same store so navigation stays in sync.
 */
export function MonthSelector() {
  const { palette } = useAppTheme();
  const monthKey = useMonthStore((state) => state.monthKey);
  const setMonthKey = useMonthStore((state) => state.setMonthKey);

  const goToMonth = (offset: number) => {
    setMonthKey(monthKeyOf(addMonths(monthKeyStartDate(monthKey), offset)));
  };

  const currentMonthKey = monthKeyOf(new Date());
  const isCurrentMonth = monthKey === currentMonthKey;

  return (
    <View style={styles.container}>
      <PressableScale
        onPress={() => goToMonth(-1)}
        style={[
          styles.arrow,
          { backgroundColor: palette.card, borderColor: palette.border },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Mes anterior"
        hitSlop={8}
      >
        <Ionicons name="chevron-back" size={18} color={palette.textPrimary} />
      </PressableScale>

      <View style={styles.center}>
        <AppText variant="subtitle" center numberOfLines={1}>
          {formatMonthLabel(monthKey)}
        </AppText>
        {!isCurrentMonth ? (
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
          styles.arrow,
          { backgroundColor: palette.card, borderColor: palette.border },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Mes siguiente"
        hitSlop={8}
      >
        <Ionicons name="chevron-forward" size={18} color={palette.textPrimary} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  arrow: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    gap: 2,
  },
});