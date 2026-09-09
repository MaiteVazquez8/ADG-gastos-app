import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/components/ThemeProvider';
import { radius } from '@/constants/layout';

interface ProgressBarProps {
  /** Progress between 0 and 100. Values above 100 are capped for display. */
  progress: number;
  color: string;
  /** Rendered above the bar when provided (e.g. spent/available label). */
  accessibilityLabel?: string;
  height?: number;
}

export function ProgressBar({ progress, color, accessibilityLabel, height = 8 }: ProgressBarProps) {
  const { palette } = useAppTheme();
  const capped = Math.max(0, Math.min(100, progress));

  return (
    <View
      style={[
        styles.track,
        { backgroundColor: palette.track, height, borderRadius: radius.full },
      ]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(capped) }}
      accessibilityLabel={accessibilityLabel}
    >
      <View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            width: `${capped}%`,
            borderRadius: radius.full,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
  },
});