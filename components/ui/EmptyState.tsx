import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/tokens';

interface EmptyStateProps {
  title: string;
  /** Invitation to act, in the app's voice — never a dead end. */
  message: string;
  /** Optional action (e.g. a Button) rendered under the message. */
  children?: React.ReactNode;
}

/** Centered empty-state block used by every data-driven screen (spec #12). */
export function EmptyState({ title, message, children }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    gap: spacing.sm,
  },
  title: {
    ...typography.lg,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...typography.base,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
