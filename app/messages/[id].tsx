import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, Send } from 'lucide-react-native';

import { MessageBubble } from '@/components/messages/MessageBubble';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, radius, spacing, typography } from '@/constants/tokens';
import { useProfile } from '@/hooks/useProfile';
import { useSendMessage } from '@/hooks/useSendMessage';
import { useThread } from '@/hooks/useThread';
import { useAuthStore } from '@/store/auth';

const SKELETON_BUBBLES = [0, 1, 2, 3];

export default function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useAuthStore((state) => state.session?.user.id);

  const counterpart = useProfile(id);
  const thread = useThread(id);
  const sendMessage = useSendMessage(id ?? 'unknown');

  const [draft, setDraft] = useState('');

  if (!userId) {
    return <Redirect href="/(auth)/welcome" />;
  }

  const handleSend = () => {
    const body = draft.trim();
    if (!body || !id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDraft('');
    sendMessage.mutate(body);
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const counterpartName = counterpart.data?.display_name ?? 'Scene member';

  let body: React.ReactNode;
  if (thread.isPending) {
    body = (
      <View style={styles.skeletons}>
        {SKELETON_BUBBLES.map((index) => (
          <Skeleton
            key={index}
            style={[
              styles.skeletonBubble,
              index % 2 === 0 ? styles.skeletonTheirs : styles.skeletonMine,
            ]}
          />
        ))}
      </View>
    );
  } else if (thread.isError) {
    body = (
      <ErrorState
        title="Couldn't load this conversation"
        message="We couldn't reach the network. Check your connection and try again."
        onRetry={() => thread.refetch()}
      />
    );
  } else {
    // Inverted list keeps the newest message pinned to the keyboard.
    const newestFirst = [...thread.data].reverse();
    body = (
      <FlatList
        data={newestFirst}
        inverted
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <MessageBubble message={item} isMine={item.sender_id === userId} />
        )}
        contentContainerStyle={[
          styles.listContent,
          thread.data.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={
          // Inverted lists flip their children — flip the empty state back.
          <View style={styles.emptyFlip}>
            <EmptyState
              title={`Say hey to ${counterpartName}`}
              message="This is the start of your conversation — lead with what you liked about their work."
            />
          </View>
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to messages"
          onPress={goBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <ChevronLeft color={colors.text} size={24} />
        </Pressable>
        <Avatar publicId={counterpart.data?.face_public_id} name={counterpartName} size={32} />
        <Text style={styles.headerName} numberOfLines={1}>
          {counterpartName}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {body}
        {sendMessage.isError ? (
          <Text style={styles.sendError}>
            That didn't send — check your connection and try again.
          </Text>
        ) : null}
        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={`Message ${counterpartName}…`}
            placeholderTextColor={colors.textMuted}
            keyboardAppearance="dark"
            multiline
            accessibilityLabel="Message text"
            style={styles.input}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: draft.trim().length === 0 }}
            disabled={draft.trim().length === 0}
            onPress={handleSend}
            style={({ pressed }) => [
              styles.sendButton,
              draft.trim().length === 0 && styles.sendDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Send color={colors.text} size={18} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 44, // accessibility floor (spec #14)
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerName: {
    ...typography.md,
    color: colors.text,
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  listEmpty: {
    flexGrow: 1,
  },
  emptyFlip: {
    flex: 1,
    transform: [{ scaleY: -1 }],
  },
  skeletons: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: spacing.md,
    padding: spacing.lg,
  },
  skeletonBubble: {
    width: '55%',
    height: 44,
    borderRadius: radius.lg,
  },
  skeletonTheirs: {
    alignSelf: 'flex-start',
  },
  skeletonMine: {
    alignSelf: 'flex-end',
  },
  sendError: {
    ...typography.xs,
    color: colors.error,
    textAlign: 'center',
    paddingBottom: spacing.xs,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    ...typography.base,
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    color: colors.text,
  },
  sendButton: {
    width: 44, // accessibility floor (spec #14)
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.4,
  },
});
