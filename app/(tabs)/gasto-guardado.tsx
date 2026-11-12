import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import { INCOME_SOURCES } from '@/constants/finance';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatArsSpaced } from '@/utils/currency';
import { resolveCategory } from '@/utils/categories';
import { useMotion } from '@/hooks/useMotion';

export default function GuardadoScreen() {
  const router = useRouter();
  const motion = useMotion();
  const { id, tipo } = useLocalSearchParams<{ id?: string; tipo?: string }>();

  const isIncome = tipo === 'ingreso';
  const expenses = useExpenseStore((state) => state.expenses);
  const incomes = useFinanceStore((state) => state.incomes);
  const categories = useFinanceStore((state) => state.categories);

  const expense = useMemo(
    () => (!isIncome ? expenses.find((item) => item.id === id) : undefined),
    [expenses, id, isIncome],
  );
  const income = useMemo(
    () => (isIncome ? incomes.find((item) => item.id === id) : undefined),
    [incomes, id, isIncome],
  );

  const amount = expense?.amount ?? income?.amount ?? 0;
  const concept =
    expense?.note?.trim() ||
    (expense ? resolveCategory(categories, expense.category).name : undefined) ||
    income?.note?.trim() ||
    INCOME_SOURCES.find((source) => source.id === income?.source)?.label ||
    (isIncome ? 'Ingreso' : 'Gasto');
  const subtitle = expense
    ? `${concept} · ${resolveCategory(categories, expense.category).name}`
    : concept;

  const successAnimation = motion ? ZoomIn.springify().damping(14) : undefined;
  const entering = motion ? FadeInUp.duration(400) : undefined;

  return (
    <Screen scroll>
      <Header title={isIncome ? 'Ingreso guardado' : 'Gasto guardado'} />

      <View style={styles.content}>
        <Animated.View entering={entering} style={styles.cardWrap}>
          <LinearGradient
            colors={['#050505', '#0B3B2B', '#169976']}
            locations={[0, 0.55, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.card}
          >
            <Animated.View entering={successAnimation} style={styles.iconWrap}>
              <MaterialCommunityIcons name="format-list-bulleted" size={34} color="#FFFFFF" />
            </Animated.View>
            <AppText variant="title" weight="800" center style={styles.title}>
              {isIncome ? '¡Ingreso guardado!' : '¡Gasto guardado!'}
            </AppText>
            <AppText variant="hero" weight="800" center tabular style={styles.amount}>
              {formatArsSpaced(amount)}
            </AppText>
            <AppText variant="label" center style={styles.subtitle}>
              {subtitle}
            </AppText>
            <View style={styles.divider} />
            <AppText variant="caption" center style={styles.footnote}>
              Tu resumen ya está actualizado.
            </AppText>
          </LinearGradient>
        </Animated.View>

        <Button
          label="Ver movimiento"
          onPress={() =>
            expense
              ? router.navigate(`/expense/${expense.id}`)
              : router.navigate(`/agregar?tipo=ingreso&id=${income?.id ?? ''}`)
          }
        />
        <Button
          label="Volver al inicio"
          variant="secondary"
          onPress={() => router.navigate('/')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  cardWrap: {
    flex: 1,
  },
  card: {
    flex: 1,
    minHeight: 380,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#169976',
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 29,
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 40,
    lineHeight: 46,
  },
  subtitle: {
    color: '#D7F5E9',
  },
  divider: {
    width: 56,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: spacing.xs,
  },
  footnote: {
    color: '#A8E6CD',
  },
});
