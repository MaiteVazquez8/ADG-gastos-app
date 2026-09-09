import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, shadows, spacing } from '@/constants/layout';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  right?: ReactNode;
}

export function ChartCard({ title, subtitle, children, right }: ChartCardProps) {
  const { palette } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        shadows.card,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="subtitle">{title}</AppText>
          {subtitle ? (
            <AppText variant="caption" tone="tertiary">
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerText: {
    gap: 2,
  },
});