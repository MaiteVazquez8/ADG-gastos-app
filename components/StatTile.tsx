import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';

interface StatTileProps {
  label: string;
  value: string;
  color: string;
}

/** Compact metric tile used to summarize a headline value with supporting stats. */
export function StatTile({ label, value, color }: StatTileProps) {
  const { palette } = useAppTheme();
  return (
    <View style={[styles.tile, { backgroundColor: palette.cardPressed }]}>
      <AppText variant="caption" tone="secondary" style={styles.label}>
        {label}
      </AppText>
      <AppText
        variant="body"
        weight="700"
        tabular
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        style={{ color }}
      >
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});