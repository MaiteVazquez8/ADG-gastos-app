import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { useAppTheme } from '@/components/ThemeProvider';
import { spacing } from '@/constants/layout';

const WIDE_BREAKPOINT = 980;

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

/**
 * Marco de pantalla de ADG. En pantallas anchas (>= 980dp) muestra la barra
 * lateral del mock escritorio y centra el contenido; en celulares usa el
 * layout de una columna con la tab bar inferior.
 */
export function Screen({
  children,
  scroll = false,
  keyboardAware = false,
  contentContainerStyle,
  overlay,
}: ScreenProps) {
  const { palette } = useAppTheme();
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;

  const content = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.scrollContent,
        wide && styles.scrollContentWide,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.padded, wide && styles.paddedWide, contentContainerStyle]}>
      {children}
    </View>
  );

  const body = (
    <SafeAreaView style={[styles.flex, { backgroundColor: palette.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.bodyRow, styles.flex]}>
          {wide ? <DesktopSidebar /> : null}
          <View style={[styles.contentArea, wide && styles.contentWide]}>
            {content}
            {overlay}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  return body;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  bodyRow: {
    flexDirection: 'row',
  },
  contentArea: {
    flex: 1,
  },
  contentWide: {
    maxWidth: 1160,
    alignSelf: 'center',
    width: '100%',
  },
  padded: {
    paddingHorizontal: spacing.xl,
  },
  paddedWide: {
    paddingHorizontal: spacing.huge,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  scrollContentWide: {
    paddingHorizontal: spacing.huge,
  },
});
