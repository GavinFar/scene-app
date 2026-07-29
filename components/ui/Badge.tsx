import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/tokens';

type BadgeTone = 'neutral' | 'accent';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
}

/** Small mono-type pill — role tags, connection platforms, statuses. */
export function Badge({ label, tone = 'neutral', style }: BadgeProps) {
  return (
    <View style={[styles.base, toneStyles[tone], style]}>
      <Text style={[styles.label, tone === 'accent' && styles.accentLabel]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  label: {
    ...typography.mono,
    color: colors.text,
  },
  accentLabel: {
    color: colors.accent,
  },
});

const toneStyles: Record<BadgeTone, ViewStyle> = {
  neutral: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accent: {
    backgroundColor: colors.accentMuted,
  },
};
