import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type ColorValue, type StyleProp, type ViewStyle } from 'react-native';
import { AnimatedAmount } from '@/components/AnimatedAmount';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { fontSize, lineHeight, radius, shadows, spacing } from '@/constants/layout';
import { formatCurrency } from '@/utils/currency';

interface SummaryCardProps {
  label: string;
  value: number;
  /** Passed by callers to tint the value; when it signals a loss the hero turns danger-colored. */
  valueColor?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Hero card for headline totals: a gradient panel (green when the balance is
 * positive, red when negative) with an animated number, over the regular card
 * surface that holds the supporting stats and actions.
 */
export function SummaryCard({ label, value, valueColor, children, style }: SummaryCardProps) {
  const { palette } = useAppTheme();
  const negative = valueColor === palette.danger;
  const gradient: readonly [ColorValue, ColorValue] = negative
    ? [palette.danger, palette.dangerStrong]
    : [palette.primary, palette.primaryStrong];

  return (
    <View
      style={[
        styles.card,
        shadows.card,
        { backgroundColor: palette.card, borderColor: palette.border },
        style,
      ]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={styles.hero}
      >
        <AppText variant="label" weight="600" style={{ color: palette.onPrimary, opacity: 0.85 }}>
          {label}
        </AppText>
        <AnimatedAmount
          value={value}
          formatValue={formatCurrency}
          color={palette.onPrimary}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          style={styles.heroValue}
        />
      </LinearGradient>

      {children ? <View style={styles.footer}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xs + 2,
  },
  heroValue: {
    fontSize: fontSize.xxxl + 4,
    lineHeight: lineHeight.xxxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
});