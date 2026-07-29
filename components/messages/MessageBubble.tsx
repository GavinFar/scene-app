import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/tokens';
import { formatRelativeTime } from '@/lib/dates';
import type { ThreadMessage } from '@/hooks/useThread';

interface MessageBubbleProps {
  message: ThreadMessage;
  /** True when the signed-in user sent it — right-aligned, accent. */
  isMine: boolean;
}

/** One DM bubble. Optimistic sends look identical — no "sending…" jank. */
export function MessageBubble({ message, isMine }: MessageBubbleProps) {
  return (
    <View style={[styles.wrap, isMine ? styles.wrapMine : styles.wrapTheirs]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={styles.body}>{message.body}</Text>
      </View>
      <Text style={styles.time}>{formatRelativeTime(message.created_at)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    maxWidth: '78%',
    gap: 2,
  },
  wrapMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  wrapTheirs: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  bubbleMine: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: radius.sm,
  },
  bubbleTheirs: {
    backgroundColor: colors.surfaceRaised,
    borderBottomLeftRadius: radius.sm,
  },
  body: {
    ...typography.base,
    color: colors.text,
  },
  time: {
    ...typography.xs,
    color: colors.textMuted,
  },
});
