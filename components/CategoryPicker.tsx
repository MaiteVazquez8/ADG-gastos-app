import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';
import { PressableScale } from '@/components/PressableScale';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import type { FinanceCategory } from '@/types';
import { alpha } from '@/utils/color';

const ICON_SIZE = 46;

interface CategoryPickerProps {
  categories: readonly FinanceCategory[];
  value: string | null;
  onChange: (categoryId: string) => void;
  error?: string;
}

export function CategoryPicker({ categories, value, onChange, error }: CategoryPickerProps) {
  const { palette, isDark } = useAppTheme();

  return (
    <View>
      <AppText variant="label" tone="secondary" style={styles.marginBottom}>
        Categoría
      </AppText>

      <View accessibilityRole="radiogroup" accessibilityLabel="Categoría">
        <View style={styles.grid}>
          {categories.map((category) => {
            const selected = value === category.id;
            const iconColor = selected ? palette.textInverse : category.color;
            const iconBackground = selected
              ? category.color
              : alpha(category.color, isDark ? 0.25 : 0.12);

            return (
              <PressableScale
                key={category.id}
                onPress={() => onChange(category.id)}
                scaleTo={0.9}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={category.name}
                style={styles.item}
              >
                <View
                  style={[
                    styles.icon,
                    {
                      width: ICON_SIZE,
                      height: ICON_SIZE,
                      borderRadius: radius.full,
                      backgroundColor: iconBackground,
                    },
                    selected && {
                      transform: [{ scale: 1.08 }],
                      borderWidth: 2,
                      borderColor: category.color,
                    },
                  ]}
                >
                  <MaterialCommunityIcons name={category.icon} size={22} color={iconColor} />
                </View>
                <AppText
                  variant="caption"
                  tone={selected ? 'primary' : 'secondary'}
                  numberOfLines={1}
                >
                  {category.name}
                </AppText>
              </PressableScale>
            );
          })}
        </View>
      </View>

      {error ? (
        <AppText variant="caption" tone="danger" style={styles.marginTop}>
          {error}
        </AppText>
      ) : categories.length === 0 ? (
        <AppText variant="caption" tone="tertiary" style={styles.marginTop}>
          Todavía no hay categorías.
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  marginBottom: {
    marginBottom: spacing.sm,
  },
  marginTop: {
    marginTop: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  item: {
    width: '25%',
    alignItems: 'center',
    gap: spacing.xs,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});