import { useEffect, useMemo, useRef, useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AdgLogo } from '@/components/AdgLogo';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthStore } from '@/store/useMonthStore';
import { buildMovementsCsv } from '@/utils/csv';
import { formatMonthLabel } from '@/utils/date';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function CargaResumenScreen() {
  const { palette } = useAppTheme();
  const router = useRouter();
  const { modo } = useLocalSearchParams<{ modo?: string }>();

  const monthKey = useMonthStore((state) => state.monthKey);
  const expenses = useExpenseStore((state) => state.expenses);
  const incomes = useFinanceStore((state) => state.incomes);
  const categories = useFinanceStore((state) => state.categories);

  const widthProgress = useSharedValue(0);
  const [percentLabel, setPercentLabel] = useState(0);
  const completedRef = useRef(false);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subtitle = modo === 'movimientos'
    ? 'Preparando todos tus movimientos'
    : `Preparando tu resumen de ${formatMonthLabel(monthKey).split(' ')[0].toLowerCase()}`;

  const csv = useMemo(
    () => buildMovementsCsv(expenses, incomes, categories),
    [expenses, incomes, categories],
  );

  useEffect(() => {
    widthProgress.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) });

    const startedAt = Date.now();
    const duration = 1500;
    const tick = setInterval(() => {
      const t = Math.min((Date.now() - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setPercentLabel(Math.round(eased * 100));
      if (t >= 1) {
        clearInterval(tick);
      }
    }, 50);

    finishTimer.current = setTimeout(() => {
      if (completedRef.current) {
        return;
      }
      completedRef.current = true;
      Share.share({
        message: csv,
        title: modo === 'movimientos' ? 'adg-movimientos.csv' : 'adg-historial.csv',
      })
        .catch(() => {
          // El usuario canceló o no hay dónde compartir: vuelve igual.
        })
        .finally(() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.navigate('/actividad');
          }
        });
    }, 1900);

    return () => {
      clearInterval(tick);
      if (finishTimer.current) {
        clearTimeout(finishTimer.current);
      }
    };
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedBar = useAnimatedStyle(() => ({
    width: `${widthProgress.value * 100}%`,
  }));

  return (
    <Screen>
      <Header title="Carga del resumen" />

      <View style={styles.content}>
        <AdgLogo variant="hero" />

        <AppText variant="title" weight="800" center style={styles.title}>
          Tus números{'\n'}toman forma.
        </AppText>
        <AppText variant="body" tone="secondary" center>
          {subtitle}
        </AppText>

        <View style={styles.progressBlock}>
          <View style={[styles.track, { backgroundColor: '#1A1A1A' }]}>
            <Animated.View style={[styles.fill, animatedBar]} />
          </View>
          <AppText variant="label" weight="700" style={[styles.percent, { color: palette.primary }]}>
            {percentLabel}%
          </AppText>
        </View>

        <AppText variant="caption" tone="tertiary" center>
          Un momento para ver todo más claro.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  progressBlock: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  track: {
    width: '100%',
    height: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: '#1DCD9F',
  },
  percent: {
    fontVariant: ['tabular-nums'],
  },
});
