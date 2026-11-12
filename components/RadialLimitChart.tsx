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
import { formatArs } from '@/utils/currency';
import { limitRingModel } from '@/utils/limitRing';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RadialLimitChartProps {
  /** Gastado en el período. */
  spent: number;
  /** Límite mensual de la categoría (0 = sin límite asignado). */
  limit: number;
  size?: number;
  thickness?: number;
}

interface ArcProps {
  color: string;
  /** Longitud del arco en grados (0-360). */
  sweep: number;
  /** Rotación inicial en grados (0 = arriba). */
  rotation: number;
  center: number;
  radius: number;
  thickness: number;
  circumference: number;
  progress: SharedValue<number>;
}

function Arc({ color, sweep, rotation, center, radius, thickness, circumference, progress }: ArcProps) {
  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: [
      Math.max((sweep / 360) * circumference * progress.value, 0),
      circumference,
    ],
  }));

  return (
    <AnimatedCircle
      animatedProps={animatedProps}
      cx={center}
      cy={center}
      r={radius}
      stroke={color}
      strokeWidth={thickness}
      fill="none"
      strokeLinecap="round"
      rotation={rotation}
      origin={`${center}, ${center}`}
    />
  );
}

/**
 * Anillo de "100% del límite vs. lo que llevás gastado" (mock ADG):
 * verde = consumido dentro del límite, rojo = lo que te excediste.
 */
export function RadialLimitChart({ spent, limit, size = 180, thickness = 24 }: RadialLimitChartProps) {
  const { palette } = useAppTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  const model = useMemo(() => limitRingModel(spent, limit), [spent, limit]);

  const radius = (size - thickness) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const usedSweep = model.usedFraction * 360;
  const excessSweep = model.excessFraction * 360;
  const usedRotation = -90;
  const excessRotation = -90 + usedSweep;

  const percentLabel = limit > 0 ? `${Math.round(model.percent)}%` : '—';
  const percentColor = model.exceeded ? palette.danger : palette.primary;

  return (
    <View
      style={styles.wrapper}
      accessibilityRole="image"
      accessibilityLabel={
        limit > 0
          ? `Gastado ${formatArs(SpentSafe(spent))} de ${formatArs(limit)}, ${Math.round(model.percent)}% del límite mensual`
          : `Gastado ${formatArs(SpentSafe(spent))}, sin límite asignado`
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
          <Arc
            color={palette.primary}
            sweep={usedSweep}
            rotation={usedRotation}
            center={center}
            radius={radius}
            thickness={thickness}
            circumference={circumference}
            progress={progress}
          />
          {excessSweep > 0.5 ? (
            <Arc
              color={palette.danger}
              sweep={excessSweep}
              rotation={excessRotation}
              center={center}
              radius={radius}
              thickness={thickness}
              circumference={circumference}
              progress={progress}
            />
          ) : null}
        </Svg>
      </Animated.View>

      <View style={styles.center} pointerEvents="none">
        <AppText variant="title" weight="800" style={{ color: percentColor }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
          {percentLabel}
        </AppText>
        <AppText variant="caption" tone="tertiary" numberOfLines={1}>
          del límite
        </AppText>
      </View>
    </View>
  );
}

function SpentSafe(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 34,
  },
});
