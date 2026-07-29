import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/tokens';

interface InputProps extends TextInputProps {
  label: string;
  /** Validation message; renders below the field and reddens the border. */
  error?: string;
}

/**
 * Text field primitive. Forwards a ref so React Hook Form / focus chains
 * (returnKeyType="next" → focus the next input) work out of the box.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, style, ...inputProps },
  ref
) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        keyboardAppearance="dark"
        style={[styles.input, error != null && styles.inputError, style]}
        {...inputProps}
      />
      {error != null && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    ...typography.sm,
    color: colors.textMuted,
  },
  input: {
    ...typography.base,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    ...typography.xs,
    color: colors.error,
  },
});
