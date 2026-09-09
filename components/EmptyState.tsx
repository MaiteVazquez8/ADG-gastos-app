import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';

interface EmptyStateProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  const { palette } = useAppTheme();

  return (
    <Animated.View
      entering={FadeInUp.duration(350)}
      style={styles.container}
      accessibilityRole="summary"
    >
      <View style={[styles.iconCircle, { backgroundColor: palette.primarySoft }]}>
        <Ionicons name={icon} size={28} color={palette.primary} />
      </View>
      <AppText variant="subtitle" center>
        {title}
      </AppText>
      {message ? (
        <AppText variant="body" tone="secondary" center style={styles.message}>
          {message}
        </AppText>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    maxWidth: 280,
  },
  action: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
  },
});