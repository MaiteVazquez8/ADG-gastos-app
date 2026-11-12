import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AnimatedAmount } from '@/components/AnimatedAmount';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { fontSize, lineHeight, radius, spacing } from '@/constants/layout';
import { formatArs } from '@/utils/currency';

interface AdgHeroCardProps {
  label: string;
  value: number;
  /** Texto chico al pie: "Ingresos − gastos · ARS". */
  footnote?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Icono de la esquina superior derecha (mock: billetera). null = ocultar. */
  icon?: keyof typeof Ionicons.glyphMap | null;
}

/**
 * Tarjeta hero de ADG: gradiente negro → verde (como en el mock) con el
 * monto animado y la etiqueta en mayúsculas.
 */
export function AdgHeroCard({ label, value, footnote, children, style, icon = 'wallet-outline' }: AdgHeroCardProps) {
  const { palette } = useAppTheme();

  return (
    <LinearGradient
      colors={['#050505', '#0B3B2B', '#169976']}
      locations={[0, 0.55, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.card, { borderColor: palette.primaryStrong }, style]}
    >
      <View style={styles.labelRow}>
        <AppText variant="label" weight="600" style={styles.label}>
          {label}
        </AppText>
        {icon ? <Ionicons name={icon} size={20} color={palette.primary} /> : null}
      </View>
      <AnimatedAmount
        value={value}
        formatValue={formatArs}
        color="#FFFFFF"
        adjustsFontSizeToFit
        minimumFontScale={0.55}
        style={styles.value}
      />
      {footnote ? (
        <AppText variant="label" style={styles.footnote}>
          {footnote}
        </AppText>
      ) : null}
      {children ? <View style={styles.children}>{children}</View> : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderWidth: 1,
    gap: spacing.xs,
    overflow: 'hidden',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  label: {
    color: '#D9D9D9',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  value: {
    fontSize: fontSize.xxxl + 4,
    lineHeight: lineHeight.xxxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  footnote: {
    color: '#C9F5E4',
    fontSize: 12,
  },
  children: {
    marginTop: spacing.sm,
  },
});
