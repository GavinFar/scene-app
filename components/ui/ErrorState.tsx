import { StyleSheet, Text, View } from 'react-native';
import { TriangleAlert } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/constants/tokens';

interface ErrorStateProps {
  title?: string;
  /** What went wrong + the next action (spec #12) — never a raw error dump. */
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/** Centered error block with a retry action, used by every data-driven screen. */
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
}: ErrorStateProps) {
  return (
    <View style={styles.wrap}>
      <TriangleAlert color={colors.error} size={28} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Button
          label={retryLabel}
          variant="secondary"
          onPress={onRetry}
          style={styles.retry}
        />
      ) : null}
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
  retry: {
    marginTop: spacing.md,
  },
});
