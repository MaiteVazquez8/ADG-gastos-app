import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends PressableProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Scale factor while pressed. */
  scaleTo?: number;
  /** Opacity while pressed (defaults to 0.85). */
  pressedOpacity?: number;
}

export function PressableScale({
  children,
  style,
  scaleTo = 0.97,
  pressedOpacity = 0.85,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn: PressableProps['onPressIn'] = (event) => {
    scale.value = withSpring(scaleTo, { damping: 16, stiffness: 300 });
    opacity.value = withTiming(pressedOpacity, { duration: 120 });
    onPressIn?.(event);
  };

  const handlePressOut: PressableProps['onPressOut'] = (event) => {
    scale.value = withSpring(1, { damping: 16, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 140 });
    onPressOut?.(event);
  };

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}