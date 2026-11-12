import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { AdgLogo } from '@/components/AdgLogo';
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

/**
 * Header de ADG: logo original a la izquierda + título (mock: toda pantalla
 * lleva el logo ADG arriba a la izquierda, con el nombre de la sección).
 * En pantallas anchas el logo vive en la barra lateral, así que se omite.
 */
export function Header({ title, subtitle, showBack = false, right, onBack }: HeaderProps) {
  const { palette } = useAppTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 980;

  const handleBack = onBack ?? (() => router.back());

  return (
    <View
      style={styles.container}
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
            <Ionicons name="chevron-back" size={20} color={palette.textPrimary} />
          </PressableScale>
        )}
        {wide ? null : <AdgLogo variant="inline" />}
        <View style={styles.titleBlock}>
          <AppText variant="subtitle" numberOfLines={1} weight="700">
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="caption" tone="secondary" numberOfLines={1}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </View>

      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 0,
  },
  titleBlock: {
    flexShrink: 1,
    gap: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
