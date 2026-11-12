import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AdgLogo } from '@/components/AdgLogo';
import { Header } from '@/components/Header';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { PROFILE_CURRENCY_NOTE, PROFILE_LABEL } from '@/constants/demo-data';
import { radius, spacing } from '@/constants/layout';
import { useMotion } from '@/hooks/useMotion';

interface MenuRowProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
}

function MenuRow({ icon, title, subtitle, onPress }: MenuRowProps) {
  const { palette } = useAppTheme();

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={22} color={palette.primary} />
      </View>
      <View style={styles.rowText}>
        <AppText variant="body" weight="600" numberOfLines={1}>
          {title}
        </AppText>
        <AppText variant="caption" tone="secondary" numberOfLines={1}>
          {subtitle}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={palette.primary} />
    </PressableScale>
  );
}

export default function PerfilScreen() {
  const router = useRouter();
  const motion = useMotion();
  const { palette } = useAppTheme();

  return (
    <Screen scroll>
      <Header title="Perfil" />

      <Animated.View entering={motion ? FadeInUp.duration(340) : undefined} style={styles.content}>
        <AppText variant="title" weight="800" style={styles.headline}>
          Tu espacio{'\n'}en ADG.
        </AppText>

        <View style={[styles.userCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.userTop}>
            <View style={[styles.avatar, { backgroundColor: palette.primarySoft }]}>
              <Ionicons name="person-outline" size={30} color={palette.primary} />
            </View>
            <View style={styles.userText}>
              <AppText variant="subtitle" weight="800">
                {PROFILE_LABEL}
              </AppText>
              <AppText variant="label" tone="secondary">
                Sin cuentas ni servidores: tus datos viven acá.
              </AppText>
            </View>
          </View>
          <View style={[styles.userDivider, { backgroundColor: palette.border }]} />
          <AppText variant="label" weight="600" style={{ color: palette.primary }}>
            {PROFILE_CURRENCY_NOTE}
          </AppText>
        </View>

        <View style={styles.menu}>
          <MenuRow
            icon="business-outline"
            title="Mis ingresos"
            subtitle="Fuentes y categorías"
            onPress={() => router.navigate('/ingresos')}
          />
          <MenuRow
            icon="settings-outline"
            title="Preferencias"
            subtitle="Moneda, formato y motion"
            onPress={() => router.navigate('/preferencias')}
          />
          <MenuRow
            icon="notifications-outline"
            title="Configuración"
            subtitle="Datos y notificaciones"
            onPress={() => router.navigate('/configuracion')}
          />
          <MenuRow
            icon="list-outline"
            title="Historial"
            subtitle="Todo tu recorrido"
            onPress={() => router.navigate('/historial')}
          />
        </View>

        <View style={styles.logoWrap}>
          <AdgLogo variant="hero" />
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  headline: {
    fontSize: 30,
    lineHeight: 36,
  },
  userCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.md,
  },
  userTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userText: {
    flex: 1,
    gap: 2,
  },
  userDivider: {
    height: 1,
  },
  menu: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  rowIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  logoWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
});
