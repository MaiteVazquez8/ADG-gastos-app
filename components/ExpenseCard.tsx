import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { CategoryBadge } from '@/components/CategoryBadge';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, shadows, spacing } from '@/constants/layout';
import { useFinanceStore } from '@/store/useFinanceStore';
import type { Expense } from '@/types';
import { resolveCategory } from '@/utils/categories';
import { alpha } from '@/utils/color';
import { formatCurrency } from '@/utils/currency';
import { formatISODateLong } from '@/utils/date';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ExpenseCardProps {
  expense: Expense;
  onPress?: () => void;
  /** Used to stagger the entrance animation in lists. */
  index?: number;
  /** Shows the expense date under the title (defaults to false). */
  showDate?: boolean;
}

export function ExpenseCard({ expense, onPress, index = 0, showDate = false }: ExpenseCardProps) {
  const { palette, isDark } = useAppTheme();
  const categories = useFinanceStore((state) => state.categories);
  const meta = useMemo(() => resolveCategory(categories, expense.category), [categories, expense.category]);
  const title = expense.note?.trim() ? expense.note.trim() : meta.name;

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={!onPress}
      entering={FadeInDown.delay(Math.min(index, 6) * 60).duration(320)}
      layout={LinearTransition.duration(220)}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${title}, ${formatCurrency(expense.amount)}`}
      style={[
        styles.card,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
        },
        shadows.card,
      ]}
    >
      <View
        style={[
          styles.icon,
          { backgroundColor: alpha(meta.color, isDark ? 0.25 : 0.14) },
        ]}
      >
        <MaterialCommunityIcons name={meta.icon} size={22} color={meta.color} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <AppText variant="body" weight="600" numberOfLines={1} style={styles.flex}>
            {title}
          </AppText>
          {showDate ? (
            <AppText variant="caption" tone="tertiary" numberOfLines={1}>
              {formatISODateLong(expense.date)}
            </AppText>
          ) : null}
        </View>
        <View style={styles.metaRow}>
          <CategoryBadge category={meta} dot />
          <AppText variant="caption" tone="tertiary">
            {meta.name}
          </AppText>
        </View>
      </View>

      <AppText variant="subtitle" weight="700" tabular>
        {formatCurrency(expense.amount)}
      </AppText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flex: {
    flex: 1,
  },
});