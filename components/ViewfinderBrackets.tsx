import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/constants/tokens';

/** Arm length of each corner mark. */
const ARM = 16;
const STROKE = 1.5;

interface ViewfinderBracketsProps {
  /** Dimmed for cards that aren't the active feed item. */
  isActive?: boolean;
}

/**
 * Camera-viewfinder corner marks framing the active feed card.
 *
 * Purely decorative — never contains content and never takes touches, so the
 * card's Pressable still owns the whole surface.
 */
export function ViewfinderBrackets({ isActive = true }: ViewfinderBracketsProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.frame, !isActive && styles.inactive]}
    >
      <View style={[styles.mark, styles.topLeft]} />
      <View style={[styles.mark, styles.topRight]} />
      <View style={[styles.mark, styles.bottomLeft]} />
      <View style={[styles.mark, styles.bottomRight]} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    left: spacing.md,
  },
  inactive: {
    opacity: 0.35,
  },
  mark: {
    position: 'absolute',
    width: ARM,
    height: ARM,
    borderColor: colors.accent,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: STROKE,
    borderLeftWidth: STROKE,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: STROKE,
    borderRightWidth: STROKE,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: STROKE,
    borderLeftWidth: STROKE,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: STROKE,
    borderRightWidth: STROKE,
  },
});
