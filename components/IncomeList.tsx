import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { PressableScale } from '@/components/PressableScale';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { INCOME_SOURCES } from '@/constants/finance';
import { radius, shadows, spacing } from '@/constants/layout';
import type { Income } from '@/types';
import { alpha } from '@/utils/color';
import { formatCurrency } from '@/utils/currency';
import { formatISODateLong } from '@/utils/date';

function sourceMeta(sourceId: string) {
  return INCOME_SOURCES.find((source) => source.id === sourceId) ?? INCOME_SOURCES[INCOME_SOURCES.length - 1];
}

interface IncomeListProps {
  incomes: readonly Income[];
  onEdit: (id: string) => void;
}

export function IncomeList({ incomes, onEdit }: IncomeListProps) {
  const { palette, isDark } = useAppTheme();

  if (incomes.length === 0) {
    return null;
  }

  return (
    <View style={styles.list}>
      {incomes.map((income, index) => {
        const meta = sourceMeta(income.source);
        const description = income.note?.trim();
        return (
          <Animated.View
            key={income.id}
            entering={FadeInDown.delay(Math.min(index, 6) * 50).duration(300)}
            layout={LinearTransition.duration(220)}
          >
            <PressableScale
              onPress={() => onEdit(income.id)}
              accessibilityRole="button"
              accessibilityLabel={`${meta.label}, ${formatCurrency(income.amount)}`}
              style={[
                styles.card,
                shadows.card,
                { backgroundColor: palette.card, borderColor: palette.border },
              ]}
            >
            <View
              style={[
                styles.icon,
                { backgroundColor: alpha(palette.primary, isDark ? 0.22 : 0.12) },
              ]}
            >
              <MaterialCommunityIcons name={meta.icon} size={22} color={palette.primary} />
            </View>

            <View style={styles.content}>
              <AppText variant="body" weight="600" numberOfLines={1}>
                {meta.label}
                {description ? ` · ${description}` : ''}
              </AppText>
              <AppText variant="caption" tone="tertiary" numberOfLines={1}>
                {formatISODateLong(income.date)}
              </AppText>
            </View>

            <AppText variant="subtitle" weight="700" tone="accent" tabular>
              +{formatCurrency(income.amount)}
            </AppText>
            </PressableScale>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
});