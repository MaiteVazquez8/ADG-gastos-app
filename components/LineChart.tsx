import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Line, Path, Stop } from 'react-native-svg';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { spacing } from '@/constants/layout';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface LineChartPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  /** Puntos acumulados en orden cronológico. */
  data: readonly LineChartPoint[];
  height?: number;
  /** Mostrar la etiqueta del primer y del último punto. */
  showEndLabels?: boolean;
}

function buildSmoothPath(values: readonly number[], width: number, height: number, padding: number): { line: string; area: string } {
  const max = Math.max(...values, 1);
  const usableW = width - padding * 2;
  const usableH = height - padding * 1.6;
  const stepX = values.length > 1 ? usableW / (values.length - 1) : usableW;

  const points = values.map((value, index) => ({
    x: padding + index * stepX,
    y: height - padding * 0.6 - (max === 0 ? 0 : (value / max) * usableH),
  }));

  if (points.length === 1) {
    const only = points[0];
    return {
      line: `M ${only.x} ${only.y} L ${only.x + 0.01} ${only.y}`,
      area: `M ${only.x} ${height} L ${only.x} ${only.y} L ${only.x + 0.01} ${only.y} L ${only.x + 0.01} ${height} Z`,
    };
  }

  // Catmull-Rom -> Bézier cúbica para una curva suave como en el mock.
  let line = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    line += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  const area = `${line} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
  return { line, area };
}

/** Línea de "Gastos acumulados" (mock): trazo verde con área tenue y guías. */
export function LineChart({ data, height = 150, showEndLabels = true }: LineChartProps) {
  const { palette } = useAppTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  const width = 340;
  const padding = 6;

  const values = useMemo(() => data.map((point) => point.value), [data]);
  const { line, area } = useMemo(() => buildSmoothPath(values, width, height, padding), [values, width, height]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: [progress.value * 2000, 2000],
  }));

  const guideYs = [height * 0.33, height * 0.66];

  return (
    <View style={styles.wrapper} accessibilityRole="image" accessibilityLabel="Gastos acumulados del mes">
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={palette.primary} stopOpacity={0.35} />
            <Stop offset="1" stopColor={palette.primary} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>

        {guideYs.map((y) => (
          <Line
            key={y}
            x1={0}
            x2={width}
            y1={y}
            y2={y}
            stroke={palette.borderStrong}
            strokeWidth={1}
            strokeDasharray="3 5"
            opacity={0.8}
          />
        ))}

        <Path d={area} fill="url(#areaFill)" />
        <AnimatedPath
          d={line}
          fill="none"
          stroke={palette.primary}
          strokeWidth={2.5}
          strokeLinecap="round"
          animatedProps={animatedProps}
        />
      </Svg>

      {showEndLabels && data.length > 1 ? (
        <View style={styles.labels}>
          <AppText variant="caption" tone="tertiary">{data[0].label}</AppText>
          <AppText variant="caption" tone="tertiary">{data[data.length - 1].label}</AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
});
