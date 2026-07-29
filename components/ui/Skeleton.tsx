import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius } from '@/constants/tokens';

interface SkeletonProps {
  /** Shape overrides — width, height, borderRadius. */
  style?: StyleProp<ViewStyle>;
}

/** Pulsing placeholder block (spec #12: loading = skeletons matching layout). */
export function Skeleton({ style }: SkeletonProps) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) return;
    opacity.value = withRepeat(withTiming(0.45, { duration: 700 }), -1, true);
  }, [opacity, reducedMotion]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.base, pulse, style]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
  },
});
