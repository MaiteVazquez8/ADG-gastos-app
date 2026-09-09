import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { PressableScale } from '@/components/PressableScale';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { layout, radius, spacing } from '@/constants/layout';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
  onBack?: () => void;
}

export function Header({ title, subtitle, showBack = false, right, onBack }: HeaderProps) {
  const { palette } = useAppTheme();
  const router = useRouter();

  const handleBack = onBack ?? (() => router.back());

  return (
    <View
      style={[styles.container, { borderBottomColor: palette.border }]}
      accessibilityRole="header"
    >
      <View style={styles.side}>
        {showBack && (
          <PressableScale
            onPress={handleBack}
            style={[
              styles.backButton,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
          </PressableScale>
        )}
      </View>

      <View style={styles.center}>
        <AppText variant="subtitle" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="secondary" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  side: {
    width: 84,
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});