import { StyleSheet, Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { useAppTheme } from '@/components/ThemeProvider';
import { fontSize, lineHeight } from '@/constants/layout';

type Variant = 'hero' | 'title' | 'subtitle' | 'body' | 'label' | 'caption' | 'button' | 'tabular';
type Tone = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'accent' | 'inverse';

interface AppTextProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
  weight?: TextStyle['fontWeight'];
  center?: boolean;
  /** Enables tabular (equally spaced) numerals for aligned money amounts. */
  tabular?: boolean;
}

const VARIANT_STYLES: Record<Variant, TextStyle> = {
  hero: { fontSize: fontSize.xxxl, lineHeight: lineHeight.xxxl, fontWeight: '800', letterSpacing: -0.5 },
  title: { fontSize: fontSize.xxl, lineHeight: lineHeight.xxl, fontWeight: '700' },
  subtitle: { fontSize: fontSize.lg, lineHeight: lineHeight.lg, fontWeight: '600' },
  body: { fontSize: fontSize.md, lineHeight: lineHeight.md, fontWeight: '400' },
  label: { fontSize: fontSize.sm, lineHeight: lineHeight.sm, fontWeight: '500' },
  caption: { fontSize: fontSize.xs, lineHeight: lineHeight.xs, fontWeight: '500' },
  button: { fontSize: fontSize.lg, lineHeight: lineHeight.lg, fontWeight: '700' },
  tabular: { fontVariant: ['tabular-nums'], fontSize: fontSize.md, lineHeight: lineHeight.md, fontWeight: '600' },
};

export function AppText({
  variant = 'body',
  tone = 'primary',
  weight,
  center,
  tabular = false,
  style,
  ...rest
}: AppTextProps) {
  const { palette } = useAppTheme();

  const toneColor: Record<Tone, string> = {
    primary: palette.textPrimary,
    secondary: palette.textSecondary,
    tertiary: palette.textTertiary,
    danger: palette.danger,
    accent: palette.primary,
    inverse: palette.textInverse,
  };

  return (
    <RNText
      {...rest}
      style={[
        styles.base,
        VARIANT_STYLES[variant],
        { color: toneColor[tone] },
        weight ? { fontWeight: weight } : null,
        center ? styles.center : null,
        tabular ? styles.tabular : null,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
  center: {
    textAlign: 'center',
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});