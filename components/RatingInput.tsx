import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { colors, spacing, typography } from '@/constants/tokens';

const MAX_RATING = 5;
const RATING_VALUES = [1, 2, 3, 4, 5];

interface RatingInputProps {
  /** Current rating, or null when nothing is picked yet. */
  value: number | null;
  onChange: (rating: number) => void;
  /** Validation message; renders below the stars. */
  error?: string;
}

/**
 * 1–5 star picker for review authoring. Mirrors ReviewCard's display stars so
 * what you tap is what renders on the sheet.
 */
export function RatingInput({ value, onChange, error }: RatingInputProps) {
  return (
    <View style={styles.wrapper}>
      <View accessibilityRole="radiogroup" accessibilityLabel="Rating" style={styles.row}>
        {RATING_VALUES.map((rating) => {
          const filled = value != null && rating <= value;
          return (
            <Pressable
              key={rating}
              accessibilityRole="radio"
              accessibilityLabel={`Rate ${rating} of ${MAX_RATING}`}
              accessibilityState={{ selected: value === rating }}
              onPress={() => {
                Haptics.selectionAsync();
                onChange(rating);
              }}
              style={({ pressed }) => [styles.star, pressed && styles.starPressed]}
            >
              <Text style={[styles.starGlyph, filled && styles.starGlyphFilled]}>★</Text>
            </Pressable>
          );
        })}
      </View>
      {error != null && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
  },
  star: {
    width: 44, // accessibility floor (spec #14)
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starPressed: {
    opacity: 0.7,
  },
  starGlyph: {
    ...typography.xl,
    color: colors.border,
  },
  starGlyphFilled: {
    color: colors.accent,
  },
  error: {
    ...typography.xs,
    color: colors.error,
  },
});
