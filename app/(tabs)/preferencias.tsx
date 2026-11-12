import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Header } from '@/components/Header';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { SelectSheet } from '@/components/SelectSheet';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useMotion } from '@/hooks/useMotion';

export default function PreferenciasScreen() {
  const { palette } = useAppTheme();
  const motion = useMotion();

  const settingsMotion = useSettingsStore((state) => state.motion);
  const setMotion = useSettingsStore((state) => state.setMotion);
  const monthlySummary = useSettingsStore((state) => state.monthlySummary);
  const setMonthlySummary = useSettingsStore((state) => state.setMonthlySummary);

  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const [sheet, setSheet] = useState<'moneda' | 'formato' | 'inicio' | 'tema' | null>(null);

  return (
    <Screen scroll>
      <Header title="Preferencias" />

      <Animated.View entering={motion ? FadeInUp.duration(340) : undefined} style={styles.content}>
        <AppText variant="title" weight="800" style={styles.headline}>
          A tu manera.
        </AppText>

        <View style={styles.list}>
          {/* Moneda */}
          <PressableScale
            onPress={() => setSheet('moneda')}
            accessibilityRole="button"
            accessibilityLabel="Moneda: ARS, Peso argentino"
            style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="business-outline" size={22} color={palette.primary} />
            </View>
            <View style={styles.rowText}>
              <AppText variant="body" weight="600">
                Moneda
              </AppText>
              <AppText variant="caption" tone="secondary">
                ARS · Peso argentino
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.primary} />
          </PressableScale>

          {/* Formato de números */}
          <PressableScale
            onPress={() => setSheet('formato')}
            accessibilityRole="button"
            accessibilityLabel="Formato de números: 1.250.000,00"
            style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="list-outline" size={22} color={palette.primary} />
            </View>
            <View style={styles.rowText}>
              <AppText variant="body" weight="600">
                Formato de números
              </AppText>
              <AppText variant="caption" tone="secondary">
                1.250.000,00
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.primary} />
          </PressableScale>

          {/* Inicio de mes */}
          <PressableScale
            onPress={() => setSheet('inicio')}
            accessibilityRole="button"
            accessibilityLabel="Inicio de mes: Día 1 de cada mes"
            style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="home-outline" size={22} color={palette.primary} />
            </View>
            <View style={styles.rowText}>
              <AppText variant="body" weight="600">
                Inicio de mes
              </AppText>
              <AppText variant="caption" tone="secondary">
                Día 1 de cada mes
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.primary} />
          </PressableScale>

          {/* Tema: identidad oscura por defecto; el modo claro se conserva */}
          <PressableScale
            onPress={() => setSheet('tema')}
            accessibilityRole="button"
            accessibilityLabel={`Tema: ${mode === 'dark' ? 'Oscuro' : mode === 'light' ? 'Claro' : 'Sistema'}`}
            style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <View style={styles.rowIcon}>
              <Ionicons name={mode === 'light' ? 'sunny-outline' : 'moon-outline'} size={22} color={palette.primary} />
            </View>
            <View style={styles.rowText}>
              <AppText variant="body" weight="600">
                Tema
              </AppText>
              <AppText variant="caption" tone="secondary">
                {mode === 'dark' ? 'Oscuro (ADG)' : mode === 'light' ? 'Claro' : 'Según el sistema'}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.primary} />
          </PressableScale>

          {/* Motion */}
          <View style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={styles.rowIcon}>
              <Ionicons name="settings-outline" size={22} color={palette.primary} />
            </View>
            <View style={styles.rowText}>
              <AppText variant="body" weight="600">
                Motion
              </AppText>
              <AppText variant="caption" tone="secondary">
                Transiciones y gráficos animados
              </AppText>
            </View>
            <Switch
              value={settingsMotion}
              onValueChange={setMotion}
              trackColor={{ false: '#2C2C2C', true: palette.primary }}
              thumbColor={settingsMotion ? '#FFFFFF' : '#8A8A8A'}
              accessibilityLabel="Motion"
            />
          </View>

          {/* Resumen mensual */}
          <View style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={styles.rowIcon}>
              <Ionicons name="list-circle-outline" size={22} color={palette.primary} />
            </View>
            <View style={styles.rowText}>
              <AppText variant="body" weight="600">
                Resumen mensual
              </AppText>
              <AppText variant="caption" tone="secondary">
                Ver balance al abrir ADG
              </AppText>
            </View>
            <Switch
              value={monthlySummary}
              onValueChange={setMonthlySummary}
              trackColor={{ false: '#2C2C2C', true: palette.primary }}
              thumbColor={monthlySummary ? '#FFFFFF' : '#8A8A8A'}
              accessibilityLabel="Resumen mensual"
            />
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <AppText variant="body" weight="700">
            Menos movimiento, misma claridad.
          </AppText>
          <AppText variant="label" tone="secondary">
            Desactivá Motion para evitar las entradas escalonadas y simplificar las transiciones.
          </AppText>
        </View>
      </Animated.View>

      {/* Selectores de Moneda / Formato / Inicio de mes: ARS y es-AR activos; otros, próximamente */}
      <SelectSheet
        visible={sheet === 'moneda'}
        title="Moneda"
        options={[
          { value: 'ARS', label: 'ARS · Peso argentino', description: 'Única moneda soportada en esta versión' },
          { value: 'USD', label: 'USD · Dólar estadounidense', disabled: true, badge: 'Próximamente' },
          { value: 'EUR', label: 'EUR · Euro', disabled: true, badge: 'Próximamente' },
        ]}
        selectedValue="ARS"
        onSelect={() => {}}
        onClose={() => setSheet(null)}
      />
      <SelectSheet
        visible={sheet === 'formato'}
        title="Formato de números"
        options={[
          { value: 'es-AR', label: '1.250.000,00', description: 'Miles con punto, decimales con coma (es-AR)' },
          { value: 'en-US', label: '1,250,000.00', disabled: true, badge: 'Próximamente' },
        ]}
        selectedValue="es-AR"
        onSelect={() => {}}
        onClose={() => setSheet(null)}
      />
      <SelectSheet
        visible={sheet === 'tema'}
        title="Tema"
        options={[
          { value: 'dark', label: 'Oscuro (ADG)', description: 'Negro y verde, la identidad de ADG' },
          { value: 'light', label: 'Claro', description: 'Superficies claras con el mismo verde' },
          { value: 'system', label: 'Según el sistema', description: 'Sigue el modo del dispositivo' },
        ]}
        selectedValue={mode}
        onSelect={(value) => setMode(value as 'dark' | 'light' | 'system')}
        onClose={() => setSheet(null)}
      />
      <SelectSheet
        visible={sheet === 'inicio'}
        title="Inicio de mes"
        options={[
          { value: 'dia-1', label: 'Día 1 de cada mes', description: 'El mes corre de día 1 al último día' },
        ]}
        selectedValue="dia-1"
        onSelect={() => {}}
        onClose={() => setSheet(null)}
      />
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
  infoCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.sm,
  },
});
