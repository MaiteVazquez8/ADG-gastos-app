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
import { ThemeProvider, useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { spacing } from '@/constants/layout';
import { useHydration } from '@/hooks/useHydration';

/**
 * Brand loading overlay. Renders the Stack beneath and fades itself out as soon
 * as hydration finishes, so there is no artificial wait: the app is usable the
 * instant the persisted data is ready.
 */
function BrandSplash() {
  const { palette } = useAppTheme();
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 720, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <Animated.View
      exiting={FadeOut.duration(300)}
      style={[styles.splash, { backgroundColor: palette.background }]}
      accessibilityViewIsModal
      accessibilityLabel="Cargando tus datos"
    >
      <Animated.View entering={FadeInUp.delay(40).duration(420)}>
        <AppText variant="title" center>
          Gastos
        </AppText>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(240).duration(320)} style={styles.indicator}>
        <Animated.View style={[styles.dot, { backgroundColor: palette.primary }, dotStyle]} />
      </Animated.View>
    </Animated.View>
  );
}

function RootNavigator() {
  const { palette } = useAppTheme();
  const hydrated = useHydration();

  return (
    <>
      <StatusBar style={palette.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: palette.background },
        }}
      />
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
    gap: spacing.md,
  },
  indicator: {
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});