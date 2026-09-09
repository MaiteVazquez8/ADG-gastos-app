import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/components/ThemeProvider';
import { spacing } from '@/constants/layout';

interface ScreenProps {
  children: ReactNode;
  /** Renders children inside a ScrollView (defaults to false). */
  scroll?: boolean;
  /** Wraps the content in a KeyboardAvoidingView (iOS pads automatically). */
  keyboardAware?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Rendered outside the scroll view, e.g. floating action buttons. */
  overlay?: ReactNode;
}

export function Screen({
  children,
  scroll = false,
  keyboardAware = false,
  contentContainerStyle,
  overlay,
}: ScreenProps) {
  const { palette } = useAppTheme();

  const content = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.padded, contentContainerStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: palette.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.flex}>{content}</View>
        {overlay}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.xl,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
});