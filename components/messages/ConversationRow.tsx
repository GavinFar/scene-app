import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { colors, radius, spacing, typography } from '@/constants/tokens';
import { formatRelativeTime } from '@/lib/dates';
import type { Conversation } from '@/hooks/useConversations';

interface ConversationRowProps {
  conversation: Conversation;
  onPress: () => void;
}

/** One inbox row: face, name, last-message preview, time, unread badge. */
export function ConversationRow({ conversation, onPress }: ConversationRowProps) {
  const { counterpart, lastMessage, unreadCount } = conversation;
  const preview = lastMessage.isMine ? `You: ${lastMessage.body}` : lastMessage.body;
  const hasUnread = unreadCount > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Conversation with ${counterpart.display_name}${hasUnread ? `, ${unreadCount} unread` : ''}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Avatar publicId={counterpart.face_public_id} name={counterpart.display_name} size={48} />
      <View style={styles.body}>
        <Text style={[styles.name, hasUnread && styles.nameUnread]} numberOfLines={1}>
          {counterpart.display_name}
        </Text>
        <Text style={[styles.preview, hasUnread && styles.previewUnread]} numberOfLines={1}>
          {preview}
        </Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.time}>{formatRelativeTime(lastMessage.created_at)}</Text>
        {hasUnread ? (
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 44, // accessibility floor (spec #14)
  },
  pressed: {
    backgroundColor: colors.surface,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.base,
    color: colors.text,
  },
  nameUnread: {
    ...typography.md,
  },
  preview: {
    ...typography.sm,
    color: colors.textMuted,
  },
  previewUnread: {
    color: colors.text,
  },
  meta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  time: {
    ...typography.xs,
    color: colors.textMuted,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeLabel: {
    ...typography.xs,
    color: colors.text,
  },
});
