import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import type { FinanceCategory } from '@/types';
import { alpha } from '@/utils/color';

interface CategoryBadgeProps {
  /** Resolved category metadata (use resolveCategory). */
  category: FinanceCategory;
  /** When true, only the colored dot is rendered (used in lists). */
  dot?: boolean;
}

export function CategoryBadge({ category, dot = false }: CategoryBadgeProps) {
  const { isDark } = useAppTheme();

  if (dot) {
    return (
      <View style={[styles.dot, { backgroundColor: category.color }]} accessibilityLabel={category.name} />
    );
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: alpha(category.color, isDark ? 0.22 : 0.14),
        },
      ]}
    >
      <MaterialCommunityIcons name={category.icon} size={14} color={category.color} />
      <AppText variant="caption" weight="600" style={{ color: category.color }}>
        {category.name}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
});