import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { PressableScale } from '@/components/PressableScale';
import { useAppTheme } from '@/components/ThemeProvider';
import { radius } from '@/constants/layout';
import { useThemeStore } from '@/store/useThemeStore';

export function ThemeToggleButton() {
  const { palette, isDark } = useAppTheme();
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <PressableScale
      onPress={() => setMode(isDark ? 'light' : 'dark')}
      style={[
        styles.iconButton,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      hitSlop={8}
    >
      <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={palette.textPrimary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});