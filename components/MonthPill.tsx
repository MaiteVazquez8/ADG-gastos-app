import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { PressableScale } from '@/components/PressableScale';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import { useMonthStore } from '@/store/useMonthStore';
import { addMonths, formatMonthKeyTiny, formatMonthLabel, monthKeyOf } from '@/utils/date';

interface MonthPillProps {
  /** 'solid' = verde con texto negro (mock). */
  variant?: 'solid' | 'ghost';
  /** Formato corto: "Nov 2026" (mock Estadísticas/Inicio) o completo "Noviembre 2026". */
  short?: boolean;
}

/**
 * Pill verde con el mes activo; tocarla abre un selector con los últimos 12
 * meses (funcional, sin salir de la pantalla).
 */
export function MonthPill({ variant = 'solid', short = true }: MonthPillProps) {
  const { palette } = useAppTheme();
  const monthKey = useMonthStore((state) => state.monthKey);
  const setMonthKey = useMonthStore((state) => state.setMonthKey);
  const [open, setOpen] = useState(false);

  const months = useMemo(() => {
    const now = new Date();
    const list: string[] = [];
    for (let i = 0; i < 12; i += 1) {
      list.push(monthKeyOf(addMonths(now, -i)));
    }
    return list;
  }, []);

  const label = short
    ? `${formatMonthKeyTiny(monthKey).charAt(0).toUpperCase()}${formatMonthKeyTiny(monthKey).slice(1)} ${monthKey.slice(0, 4)}`
    : formatMonthLabel(monthKey);

  const solid = variant === 'solid';

  return (
    <>
      <PressableScale
        onPress={() => setOpen(true)}
        scaleTo={0.94}
        accessibilityRole="button"
        accessibilityLabel={`Mes activo: ${formatMonthLabel(monthKey)}. Tocar para cambiar`}
        style={[
          styles.pill,
          solid
            ? { backgroundColor: palette.primary }
            : { backgroundColor: palette.card, borderColor: palette.border, borderWidth: 1 },
        ]}
      >
        <AppText
          variant="label"
          weight="700"
          numberOfLines={1}
          style={{ color: solid ? palette.onPrimary : palette.textPrimary }}
        >
          {label}
        </AppText>
        <Ionicons
          name="chevron-down"
          size={14}
          color={solid ? palette.onPrimary : palette.textSecondary}
        />
      </PressableScale>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Cerrar">
          <View style={[styles.sheet, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <AppText variant="label" tone="secondary" style={styles.sheetTitle}>
              Elegí un mes
            </AppText>
            {months.map((key) => {
              const selected = key === monthKey;
              return (
                <Pressable
                  key={key}
                  onPress={() => {
                    setMonthKey(key);
                    setOpen(false);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={[
                    styles.option,
                    selected && { backgroundColor: palette.primarySoft },
                  ]}
                >
                  <AppText variant="body" weight={selected ? '700' : '400'}>
                    {formatMonthLabel(key)}
                  </AppText>
                  {selected ? <Ionicons name="checkmark" size={18} color={palette.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 34,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    maxHeight: 440,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  sheetTitle: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
});
