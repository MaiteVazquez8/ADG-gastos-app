import { useEffect, useRef, useState } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { useAppTheme } from '@/components/ThemeProvider';

interface AnimatedAmountProps {
  value: number;
  /** Formats the animated number for display (e.g. formatCurrency). */
  formatValue: (value: number) => string;
  color?: string;
  style?: StyleProp<TextStyle>;
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
}

const DURATION = 650;

/**
 * Renders a number that tweens from the previous value (or 0 on mount) to the
 * current one, so money amounts feel alive without re-plumbing formats.
 */
export function AnimatedAmount({
  value,
  formatValue,
  color,
  style,
  adjustsFontSizeToFit,
  minimumFontScale,
}: AnimatedAmountProps) {
  const { palette } = useAppTheme();
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (value - from) * eased;
      fromRef.current = next;
      setDisplay(next);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value]);

  return (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={minimumFontScale}
      style={[{ color: color ?? palette.textPrimary, fontVariant: ['tabular-nums'] }, style]}
    >
      {formatValue(display)}
    </Text>
  );
}