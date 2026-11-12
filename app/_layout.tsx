import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  FadeOut,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AdgLogo } from '@/components/AdgLogo';
import { AppText } from '@/components/Text';
import { ThemeProvider, useAppTheme } from '@/components/ThemeProvider';
import { seedDemoDataIfNeeded } from '@/store/demoSeed';
import { useHydration } from '@/hooks/useHydration';

/**
 * Splash de marca ADG. Se monta sobre el Stack mientras los storages se
 * hidratan; una vez listos, siembra los datos de demostración (solo primera
 * vez) y se desvanece.
 */
function BrandSplash() {
  const { palette } = useAppTheme();
  const pulse = useSharedValue(0.4);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 720, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const barStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <Animated.View
      exiting={FadeOut.duration(320)}
      style={[styles.splash, { backgroundColor: palette.background }]}
      accessibilityViewIsModal
      accessibilityLabel="Cargando ADG"
    >
      <Animated.View entering={FadeInUp.delay(40).duration(420)} style={styles.logoWrap}>
        <AdgLogo variant="hero" />
      </Animated.View>
      <Animated.View entering={FadeIn.delay(180).duration(320)} style={styles.tagline}>
        <AppText variant="label" tone="secondary" center style={styles.taglineText}>
          Administración Digital de Gastos
        </AppText>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(260).duration(320)}>
        <Animated.View style={[styles.bar, barStyle]} />
      </Animated.View>
    </Animated.View>
  );
}

function RootNavigator() {
  const { palette } = useAppTheme();
  const hydrated = useHydration();

  useEffect(() => {
    if (hydrated) {
      seedDemoDataIfNeeded();
    }
  }, [hydrated]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: palette.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
      </Stack>
      {!hydrated ? <BrandSplash /> : null}
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  splash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  logoWrap: {
    alignItems: 'center',
  },
  tagline: {
    alignItems: 'center',
  },
  taglineText: {
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  bar: {
    width: 120,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#1DCD9F',
  },
});
