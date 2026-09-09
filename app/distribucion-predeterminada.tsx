import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { DistributionEditor } from '@/components/DistributionEditor';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { spacing } from '@/constants/layout';
import { useFinanceStore } from '@/store/useFinanceStore';

export default function DistribucionPredeterminadaScreen() {
  const router = useRouter();

  const categories = useFinanceStore((state) => state.categories);
  const defaultDistribution = useFinanceStore((state) => state.defaultDistribution);
  const setDefaultDistribution = useFinanceStore((state) => state.setDefaultDistribution);
  const resetDefaultDistribution = useFinanceStore((state) => state.resetDefaultDistribution);

  return (
    <Screen scroll keyboardAware>
      <Header
        title="Distribución habitual"
        subtitle="Punto de partida de cada mes"
        showBack
      />

      <View style={styles.content}>
        <DistributionEditor
          categories={categories}
          incomeTotal={0}
          distributions={defaultDistribution}
          incomeNote="Se usa como punto de partida para los meses que no personalizaste. Cambiarla no altera los meses ya configurados."
          saveLabel="Guardar distribución habitual"
          onSave={(next) => {
            setDefaultDistribution(next);
            router.back();
          }}
          extraAction={
            categories.length === 0 ? (
              <Button
                label="Nueva categoría"
                variant="secondary"
                size="sm"
                onPress={() => router.push('/categoria')}
              />
            ) : (
              <Button
                label="Restablecer valores de ejemplo"
                variant="secondary"
                size="sm"
                onPress={() => resetDefaultDistribution()}
              />
            )
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