import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { PressableScale } from '@/components/PressableScale';
import { ProgressBar } from '@/components/ProgressBar';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, shadows, spacing } from '@/constants/layout';
import type { BudgetCategoryRow } from '@/utils/budget';
import { alpha } from '@/utils/color';
import { formatCurrency } from '@/utils/currency';

interface BudgetCategoryCardProps {
  row: BudgetCategoryRow;
  onPress?: () => void;
  /** Shows progress relative to the assigned percentage (Presupuesto). */
  mode?: 'budget' | 'distribution';
}

function statusColor(status: BudgetCategoryRow['status'], palette: ReturnType<typeof useAppTheme>['palette']): string {
  if (status === 'exceeded' || status === 'alert') {
    return palette.danger;
  }
  if (status === 'warning') {
    return palette.warning;
  }
  return palette.primary;
}

function statusLabel(status: BudgetCategoryRow['status'], available: number): string {
  if (status === 'exceeded') {
    return `Excedido por ${formatCurrency(Math.abs(available))}`;
  }
  if (status === 'alert') {
    return `Al límite · Disponible ${formatCurrency(available)}`;
  }
  if (status === 'warning') {
    return `Cerca del límite · Disponible ${formatCurrency(available)}`;
  }
  return `Disponible ${formatCurrency(available)}`;
}

export function BudgetCategoryCard({
  row,
  onPress,
  mode = 'budget',
}: BudgetCategoryCardProps) {
  const { palette, isDark } = useAppTheme();
  const color = statusColor(row.status, palette);
  const progress = mode === 'distribution' ? row.percentage : row.progress;

  return (
    <Animated.View layout={LinearTransition.duration(220)}>
    <PressableScale
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${row.name}, ${row.percentage}%, ${formatCurrency(row.budget)} asignados`}
      style={[
        styles.card,
        shadows.card,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.icon,
            { backgroundColor: alpha(row.color, isDark ? 0.25 : 0.14) },
          ]}
        >
          <MaterialCommunityIcons name={row.icon} size={20} color={row.color} />
        </View>

        <View style={styles.headerText}>
          <AppText variant="body" weight="600" numberOfLines={1}>
            {row.name}
          </AppText>
          <View style={styles.metaRow}>
            <View style={[styles.percentChip, { backgroundColor: alpha(row.color, isDark ? 0.22 : 0.12) }]}>
              <AppText variant="caption" weight="700" style={{ color: row.color }}>
                {row.percentage}%
              </AppText>
            </View>
            {mode === 'budget' && row.budget > 0 ? (
              <AppText variant="caption" tone="tertiary" numberOfLines={1}>
                {formatCurrency(row.budget)} · {row.count} {row.count === 1 ? 'gasto' : 'gastos'}
              </AppText>
            ) : (
              <AppText variant="caption" tone="tertiary" numberOfLines={1}>
                {formatCurrency(row.budget)} asignados
              </AppText>
            )}
          </View>
        </View>

        <AppText variant="subtitle" weight="700" tabular numberOfLines={1}>
          {formatCurrency(row.budget)}
        </AppText>
      </View>

      <View style={styles.progressWrap}>
        <ProgressBar
          progress={progress}
          color={color}
          accessibilityLabel={`${row.name}: ${Math.round(progress)}% usado`}
        />
      </View>

      <View style={styles.footer}>
        <AppText variant="caption" tone="secondary" tabular>
          {mode === 'budget'
            ? `Gastado ${formatCurrency(row.spent)}`
            : `${row.percentage}% del ingreso`}
        </AppText>
        {mode === 'budget' ? (
          <AppText
            variant="caption"
            weight="700"
            tabular
            style={{ color: row.status === 'ok' ? palette.success : color }}
          >
            {statusLabel(row.status, row.available)}
          </AppText>
        ) : null}
      </View>
    </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  percentChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  progressWrap: {
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
});