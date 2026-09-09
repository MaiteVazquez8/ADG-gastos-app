import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInUp,
  useAnimatedProps,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface DonutSegment {
  key: string;
  label: string;
  color: string;
  value: number;
}

interface DonutChartProps {
  data: readonly DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}

interface Segment {
  key: string;
  color: string;
  rotation: number;
  dashLength: number;
}

interface SegmentRingProps {
  segment: Segment;
  center: number;
  radius: number;
  thickness: number;
  circumference: number;
  progress: SharedValue<number>;
}

function SegmentRing({
  segment,
  center,
  radius,
  thickness,
  circumference,
  progress,
}: SegmentRingProps) {
  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: [Math.max(segment.dashLength * progress.value, 0), circumference],
  }));

  return (
    <AnimatedCircle
      animatedProps={animatedProps}
      cx={center}
      cy={center}
      r={radius}
      stroke={segment.color}
      strokeWidth={thickness}
      fill="none"
      strokeLinecap="round"
      rotation={segment.rotation}
      origin={`${center}, ${center}`}
    />
  );
}

/** Donut chart. Renders one segment per slice, sized by share of the total. */
export function DonutChart({
  data,
  size = 190,
  thickness = 26,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const { palette } = useAppTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  const radius = (size - thickness) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const gapPx = data.length > 1 ? Math.min(thickness + 2, 10) : 0;

  const segments = useMemo<Segment[]>(() => {
    const sweeps = data.map((entry) => (total === 0 ? 0 : (entry.value / total) * 360));
    return data.map((entry, index) => {
      const startAngle = sweeps.slice(0, index).reduce((sum, sweep) => sum + sweep, 0);
      const dashLength = Math.max((sweeps[index] / 360) * circumference - gapPx, 0);
      return {
        key: entry.key,
        color: entry.color,
        rotation: startAngle - 90,
        dashLength,
      };
    });
  }, [data, total, circumference, gapPx]);

  return (
    <View
      style={styles.wrapper}
      accessibilityRole="image"
      accessibilityLabel={
        centerLabel
          ? `${centerLabel}${centerValue ? `: ${centerValue}` : ''}`
          : 'Distribución por categoría'
      }
    >
      <Animated.View entering={FadeInUp.duration(500)}>
        <Svg width={size} height={size}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={palette.track}
            strokeWidth={thickness}
            fill="none"
          />
          {segments.map((segment) => (
            <SegmentRing
              key={segment.key}
              segment={segment}
              center={center}
              radius={radius}
              thickness={thickness}
              circumference={circumference}
              progress={progress}
            />
          ))}
        </Svg>
      </Animated.View>

      {centerValue ? (
        <View
          style={styles.center}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <AppText variant="label" tone="secondary" numberOfLines={1}>
            {centerLabel}
          </AppText>
          <AppText variant="title" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {centerValue}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 40,
  },
});