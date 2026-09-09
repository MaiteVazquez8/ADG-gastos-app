import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';

export interface BarDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: readonly BarDatum[];
  height?: number;
  formatValue?: (value: number) => string;
}

const AnimatedView = Animated.View;

export function BarChart({ data, height = 132, formatValue }: BarChartProps) {
  const { palette } = useAppTheme();
  const max = Math.max(...data.map((entry) => entry.value), 1);

  return (
    <View accessibilityRole="image" accessibilityLabel="Monthly spending chart">
      <View style={[styles.plot, { height }]}>
        {data.map((entry, index) => {
          const barHeight = entry.value === 0 ? 0 : Math.max((entry.value / max) * height, 4);
          const isLast = index === data.length - 1;

          return (
            <View key={entry.label} style={styles.column}>
              <View style={styles.valueSlot}>
                {entry.value > 0 && formatValue ? (
                  <AppText variant="caption" tone="tertiary" numberOfLines={1}>
                    {formatValue(entry.value)}
                  </AppText>
                ) : null}
              </View>
              <AnimatedView
                entering={FadeInUp.delay(index * 70).duration(400)}
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: isLast ? palette.primaryStrong : palette.primary,
                    opacity: entry.value === 0 ? 0.35 : 1,
                  },
                ]}
                accessibilityLabel={`${entry.label}: ${entry.value}`}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.labels} accessibilityElementsHidden>
        {data.map((entry) => (
          <AppText
            key={entry.label}
            variant="caption"
            tone="tertiary"
            center
            numberOfLines={1}
            style={styles.label}
          >
            {entry.label}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  valueSlot: {
    height: 18,
    marginBottom: 4,
  },
  bar: {
    width: '100%',
    maxWidth: 34,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  labels: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  label: {
    flex: 1,
  },
});