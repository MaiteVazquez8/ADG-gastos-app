import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { DistributionEditor } from '@/components/DistributionEditor';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { spacing } from '@/constants/layout';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthStore } from '@/store/useMonthStore';
import { resolveMonthDistribution, totalIncomeForMonth } from '@/utils/budget';
import { formatMonthLabel } from '@/utils/date';

export default function DistribucionScreen() {
  const router = useRouter();
  const monthKey = useMonthStore((state) => state.monthKey);

  const categories = useFinanceStore((state) => state.categories);
  const incomes = useFinanceStore((state) => state.incomes);
  const distributionsByMonth = useFinanceStore((state) => state.distributionsByMonth);
  const defaultDistribution = useFinanceStore((state) => state.defaultDistribution);
  const setMonthDistributions = useFinanceStore((state) => state.setMonthDistributions);

  const activeDistribution = useMemo(
    () => resolveMonthDistribution(distributionsByMonth, defaultDistribution, monthKey),
    [distributionsByMonth, defaultDistribution, monthKey],
  );
  const incomeTotal = useMemo(() => totalIncomeForMonth(incomes, monthKey), [incomes, monthKey]);

  return (
    <Screen scroll keyboardAware>
      <Header title="Distribución" subtitle={formatMonthLabel(monthKey)} showBack />

      <View style={styles.content}>
        <DistributionEditor
          categories={categories}
          incomeTotal={incomeTotal}
          distributions={activeDistribution}
          saveLabel="Guardar distribución"
          onSave={(next) => {
            setMonthDistributions(monthKey, next);
            router.back();
          }}
          extraAction={
            <Button
              label="Nueva categoría"
              variant="secondary"
              size="sm"
              onPress={() => router.push('/categoria?distribucion=1')}
            />
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
  },
});