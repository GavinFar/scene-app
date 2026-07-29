import { Pressable, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

import { colors, radius, spacing, typography } from '@/constants/tokens';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

/** Toggleable filter pill — the search screen's chip rows are built from these. */
export function Chip({ label, selected, onPress }: ChipProps) {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={handlePress}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44, // accessibility floor (spec #14)
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  selected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    ...typography.mono,
    color: colors.text,
  },
  selectedLabel: {
    color: colors.accent,
  },
});
