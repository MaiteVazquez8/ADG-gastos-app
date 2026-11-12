import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AdgLogo } from '@/components/AdgLogo';
import { Header } from '@/components/Header';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { DEMO_DEVELOPER_NOTE } from '@/constants/demo-data';
import { radius, spacing } from '@/constants/layout';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useMotion } from '@/hooks/useMotion';

function ToggleRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  accessibilityLabel,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
}) {
  const { palette } = useAppTheme();

  return (
    <View style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={22} color={palette.primary} />
      </View>
      <View style={styles.rowText}>
        <AppText variant="body" weight="600">
          {title}
        </AppText>
        <AppText variant="caption" tone="secondary">
          {subtitle}
        </AppText>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#2C2C2C', true: palette.primary }}
        thumbColor={value ? '#FFFFFF' : '#8A8A8A'}
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
}

function LinkRow({
  icon,
  title,
  subtitle,
  onPress,
  accessibilityLabel,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const { palette } = useAppTheme();

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={22} color={palette.primary} />
      </View>
      <View style={styles.rowText}>
        <AppText variant="body" weight="600">
          {title}
        </AppText>
        <AppText variant="caption" tone="secondary">
          {subtitle}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={palette.primary} />
    </PressableScale>
  );
}

export default function ConfiguracionScreen() {
  const { palette } = useAppTheme();
  const router = useRouter();
  const motion = useMotion();

  const budgetAlerts = useSettingsStore((state) => state.budgetAlerts);
  const setBudgetAlerts = useSettingsStore((state) => state.setBudgetAlerts);
  const reminders = useSettingsStore((state) => state.reminders);
  const setReminders = useSettingsStore((state) => state.setReminders);

  const [helpVisible, setHelpVisible] = useState(false);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Screen scroll>
      <Header title="Configuración" />

      <Animated.View entering={motion ? FadeInUp.duration(340) : undefined} style={styles.content}>
        <AppText variant="title" weight="800" style={styles.headline}>
          Todo bajo{'\n'}tu control.
        </AppText>

        <View style={styles.list}>
          <ToggleRow
            icon="notifications-outline"
            title="Alertas de presupuesto"
            subtitle="Avisar al llegar al 80%"
            value={budgetAlerts}
            onValueChange={setBudgetAlerts}
            accessibilityLabel="Alertas de presupuesto"
          />
          <ToggleRow
            icon="alarm-outline"
            title="Recordatorios"
            subtitle={reminders ? 'Todos los días · 20:00' : 'Desactivados'}
            value={reminders}
            onValueChange={setReminders}
            accessibilityLabel="Recordatorios"
          />
          <LinkRow
            icon="download-outline"
            title="Exportar movimientos"
            subtitle="Formato CSV"
            onPress={() => router.navigate('/carga-resumen?modo=movimientos')}
            accessibilityLabel="Exportar movimientos en CSV"
          />
          <LinkRow
            icon="pricetag-outline"
            title="Administrar categorías"
            subtitle="Gastos e ingresos"
            onPress={() => router.navigate('/categorias')}
            accessibilityLabel="Administrar categorías"
          />
          <LinkRow
            icon="swap-horizontal-outline"
            title="Distribución de ingresos"
            subtitle="Porcentajes por categoría"
            onPress={() => router.navigate('/distribucion')}
            accessibilityLabel="Distribución de ingresos por porcentaje"
          />
          <LinkRow
            icon="albums-outline"
            title="Distribución habitual"
            subtitle="Plantilla para meses nuevos"
            onPress={() => router.navigate('/distribucion-predeterminada')}
            accessibilityLabel="Distribución habitual"
          />
          <LinkRow
            icon="help-circle-outline"
            title="Ayuda y privacidad"
            subtitle="Información sobre tus datos"
            onPress={() => setHelpVisible(true)}
            accessibilityLabel="Ayuda y privacidad"
          />
        </View>

        <View style={styles.footer}>
          <AppText variant="label" weight="700" style={styles.footerBrand}>
            {DEMO_DEVELOPER_NOTE}
          </AppText>
          <AppText variant="caption" tone="secondary" center>
            Versión {version} · Tus decisiones, más claras.
          </AppText>
          <View style={styles.logoWrap}>
            <AdgLogo variant="hero" />
          </View>
        </View>
      </Animated.View>

      {/* Ayuda y privacidad */}
      <Modal visible={helpVisible} transparent animationType="fade" onRequestClose={() => setHelpVisible(false)}>
        <View style={[styles.overlay, { backgroundColor: palette.overlay }]}>
          <Pressable style={styles.backdrop} onPress={() => setHelpVisible(false)} accessibilityLabel="Cerrar" />
          <View style={[styles.sheet, { backgroundColor: palette.card }]}>
            <View style={styles.sheetHeader}>
              <AppText variant="subtitle" weight="700">
                Ayuda y privacidad
              </AppText>
              <Pressable onPress={() => setHelpVisible(false)} hitSlop={12} accessibilityLabel="Cerrar" accessibilityRole="button">
                <Ionicons name="close" size={24} color={palette.textSecondary} />
              </Pressable>
            </View>
            <AppText variant="body" tone="secondary" style={styles.sheetBody}>
              ADG guarda tus datos únicamente en este dispositivo: movimientos, categorías, presupuestos y preferencias no salen de tu teléfono.{'\n\n'}
              No hay cuentas, servidores ni sincronización. Si desinstalás la app o borrás sus datos, la información se pierde. Podés exportar tus movimientos en CSV desde Configuración.
            </AppText>
            <PressableScale
              onPress={() => setHelpVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Entendido"
              style={[styles.sheetButton, { backgroundColor: palette.primary }]}
            >
              <AppText variant="button" weight="700" style={{ color: palette.onPrimary }}>
                Entendido
              </AppText>
            </PressableScale>
          </View>
        </View>
      </Modal>
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
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    minHeight: 72,
  },
  rowIcon: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  footerBrand: {
    color: '#1DCD9F',
    letterSpacing: 0.4,
  },
  logoWrap: {
    paddingVertical: spacing.xl,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
    maxWidth: 460,
    alignSelf: 'center',
    width: '100%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sheetBody: {
    lineHeight: 22,
  },
  sheetButton: {
    borderRadius: radius.lg,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
