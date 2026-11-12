import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { spacing } from '@/constants/layout';

export interface GroupedBarGroup {
  label: string;
  /** Serie anterior (blanco), p. ej. Octubre. */
  previous: number;
  /** Serie actual (verde), p. ej. Noviembre. */
  current: number;
}

interface GroupedBarChartProps {
  groups: readonly GroupedBarGroup[];
  height?: number;
  /** Formato de valores sobre las barras (mock: miles, "1.120"). */
  formatValue?: (value: number) => string;
}

/** Barras agrupadas Octubre (blanco) vs Noviembre (verde) — mock Comparación. */
export function GroupedBarChart({ groups, height = 190, formatValue }: GroupedBarChartProps) {
  const { palette } = useAppTheme();
  const max = Math.max(...groups.flatMap((group) => [group.previous, group.current]), 1);

  return (
    <View accessibilityRole="image" accessibilityLabel="Comparación de ingresos, gastos y disponible entre meses">
      <View style={[styles.plot, { height }]}>
        {groups.map((group, index) => {
          const previousHeight = group.previous <= 0 ? 0 : Math.max((group.previous / max) * (height - 30), 6);
          const currentHeight = group.current <= 0 ? 0 : Math.max((group.current / max) * (height - 30), 6);
          return (
            <View key={group.label} style={styles.column}>
              <View style={styles.bars}>
                <View style={styles.barSlot}>
                  {formatValue && group.previous > 0 ? (
                    <AppText variant="caption" tone="tertiary" numberOfLines={1}>
                      {formatValue(group.previous)}
                    </AppText>
                  ) : (
                    <View style={styles.valueSpace} />
                  )}
                  <Animated.View
                    entering={FadeInUp.delay(index * 90).duration(450)}
                    style={[styles.bar, { height: previousHeight, backgroundColor: '#FFFFFF', borderRadius: 5 }]}
                  />
                </View>
                <View style={styles.barSlot}>
                  {formatValue && group.current > 0 ? (
                    <AppText variant="caption" tone="secondary" numberOfLines={1}>
                      {formatValue(group.current)}
                    </AppText>
                  ) : (
                    <View style={styles.valueSpace} />
                  )}
                  <Animated.View
                    entering={FadeInUp.delay(index * 90 + 60).duration(450)}
                    style={[styles.bar, { height: currentHeight, backgroundColor: palette.primary, borderRadius: 5 }]}
                  />
                </View>
              </View>
              <AppText variant="caption" tone="secondary" center numberOfLines={1} style={styles.groupLabel}>
                {group.label}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    flex: 1,
  },
  barSlot: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  bar: {
    width: 22,
  },
  valueSpace: {
    height: 16,
  },
  groupLabel: {
    marginTop: 2,
  },
});
