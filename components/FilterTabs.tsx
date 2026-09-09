import { ScrollView, StyleSheet } from 'react-native';
import { PressableScale } from '@/components/PressableScale';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';

export interface FilterTabOption<T extends string> {
  label: string;
  value: T;
}

interface FilterTabsProps<T extends string> {
  options: readonly FilterTabOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

export function FilterTabs<T extends string>({ options, selected, onSelect }: FilterTabsProps<T>) {
  const { palette } = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      accessibilityRole="tablist"
    >
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <PressableScale
            key={option.value}
            onPress={() => onSelect(option.value)}
            scaleTo={0.94}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            style={[
              styles.chip,
              {
                backgroundColor: active ? palette.primary : palette.card,
                borderColor: active ? palette.primary : palette.border,
              },
            ]}
          >
            <AppText
              variant="label"
              weight="600"
              style={{ color: active ? palette.onPrimary : palette.textSecondary }}
            >
              {option.label}
            </AppText>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});