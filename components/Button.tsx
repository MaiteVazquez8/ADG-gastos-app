import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from '@/components/PressableScale';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'md' | 'sm';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
}: ButtonProps) {
  const { palette } = useAppTheme();

  const backgroundColor =
    variant === 'primary'
      ? palette.primary
      : variant === 'danger'
        ? palette.danger
        : variant === 'secondary'
          ? palette.card
          : 'transparent';

  const textColor =
    variant === 'primary'
      ? palette.onPrimary
      : variant === 'danger'
        ? palette.textInverse
        : variant === 'secondary'
          ? palette.textPrimary
          : palette.primary;

  const borderColor = variant === 'secondary' ? palette.border : 'transparent';

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[
        styles.base,
        size === 'sm' && styles.sm,
        { backgroundColor, borderColor },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size={size === 'sm' ? 'small' : undefined} />
      ) : (
        <>
          {icon}
          <AppText
            variant={size === 'sm' ? 'label' : 'button'}
            weight="700"
            style={{ color: textColor }}
            numberOfLines={1}
          >
            {label}
          </AppText>
        </>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sm: {
    minHeight: 40,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
});