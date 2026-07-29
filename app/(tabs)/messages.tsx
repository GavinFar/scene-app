import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ConversationRow } from '@/components/messages/ConversationRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, radius, spacing, typography } from '@/constants/tokens';
import { useConversations } from '@/hooks/useConversations';

const SKELETON_ROWS = [0, 1, 2];

export default function MessagesTab() {
  const conversations = useConversations();

  const openThread = (counterpartId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/messages/${counterpartId}`);
  };

  let body: React.ReactNode;
  if (conversations.isPending) {
    body = (
      <View style={styles.skeletons}>
        {SKELETON_ROWS.map((index) => (
          <View key={index} style={styles.skeletonRow}>
            <Skeleton style={styles.skeletonAvatar} />
            <View style={styles.skeletonText}>
              <Skeleton style={styles.skeletonName} />
              <Skeleton style={styles.skeletonPreview} />
            </View>
          </View>
        ))}
      </View>
    );
  } else if (conversations.isError) {
    body = (
      <ErrorState
        title="Couldn't load your messages"
        message="We couldn't reach the network. Check your connection and try again."
        onRetry={() => conversations.refetch()}
      />
    );
  } else {
    body = (
      <FlatList
        data={conversations.data}
        keyExtractor={(item) => item.counterpart.id}
        renderItem={({ item }) => (
          <ConversationRow
            conversation={item}
            onPress={() => openThread(item.counterpart.id)}
          />
        )}
        contentContainerStyle={conversations.data.length === 0 && styles.listEmpty}
        refreshControl={
          <RefreshControl
            refreshing={conversations.isRefetching}
            onRefresh={() => conversations.refetch()}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No messages yet"
            message="Reach out to someone whose work you like — DMs land here."
          />
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages.</Text>
      </View>
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography['2xl'],
    color: colors.text,
  },
  listEmpty: {
    flexGrow: 1,
  },
  skeletons: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
  },
  skeletonText: {
    flex: 1,
    gap: spacing.sm,
  },
  skeletonName: {
    width: '40%',
    height: 14,
  },
  skeletonPreview: {
    width: '75%',
    height: 12,
  },
});
