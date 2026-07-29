import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/tokens';

/** Experience is self-rated 1–5 (locked decision #3). */
const DOT_COUNT = 5;

interface ExperienceDotsProps {
  experience: number;
  /** Dot diameter. */
  size?: number;
}

/** ● ● ● ○ ○ — per-role self-rated experience. */
export function ExperienceDots({ experience, size = 7 }: ExperienceDotsProps) {
  const filled = Math.max(0, Math.min(DOT_COUNT, Math.round(experience)));
  const dotShape = { width: size, height: size, borderRadius: radius.full };

  return (
    <View
      accessible
      accessibilityLabel={`Experience ${filled} of ${DOT_COUNT}`}
      style={styles.row}
    >
      {Array.from({ length: DOT_COUNT }, (_, index) => (
        <View key={index} style={[dotShape, index < filled ? styles.filled : styles.hollow]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filled: {
    backgroundColor: colors.accent,
  },
  hollow: {
    borderWidth: 1,
    borderColor: colors.textMuted,
  },
});
