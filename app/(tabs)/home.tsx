import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import type { ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ProfileCard } from '@/components/ProfileCard';
import { ProfileCardSkeleton } from '@/components/ProfileCardSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { colors, spacing, typography } from '@/constants/tokens';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import { useProfiles } from '@/hooks/useProfiles';
import type { FeedProfile } from '@/hooks/useProfiles';
import { useAuthStore } from '@/store/auth';

// Cards fill most of the viewport (dating-app layout) while the next card
// peeks in from below so the feed reads as scrollable.
const CARD_HEIGHT_RATIO = 0.66;

// A card counts as "in view" (video autoplays) past this visibility share.
const VIEWABLE_THRESHOLD_PERCENT = 60;

export default function HomeTab() {
  const { width, height } = useWindowDimensions();
  const cardWidth = width - spacing.lg * 2;
  const cardHeight = Math.round(height * CARD_HEIGHT_RATIO);

  const userId = useAuthStore((state) => state.session?.user.id);
  const currentProfile = useCurrentProfile();
  const profiles = useProfiles({
    cityId: currentProfile.data?.city_id ?? null,
    excludeProfileId: userId ?? null,
    // Wait for the user's city so the feed loads once, correctly scoped.
    enabled: !currentProfile.isPending,
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<FeedProfile>[] }) => {
      setActiveId(viewableItems[0]?.item.id ?? null);
    }
  ).current;
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: VIEWABLE_THRESHOLD_PERCENT,
  }).current;

  // Austin is the launch city — the header switches once the profile loads.
  const cityName = currentProfile.data?.city?.name ?? 'Austin';

  let body: ReactNode;
  if (currentProfile.isPending || profiles.isPending) {
    body = (
      <View style={styles.listContent}>
        <ProfileCardSkeleton width={cardWidth} height={cardHeight} />
        <ProfileCardSkeleton width={cardWidth} height={cardHeight} />
      </View>
    );
  } else if (profiles.isError) {
    body = (
      <ErrorState
        title="Couldn't load the scene"
        message="We couldn't reach the network. Check your connection and try again."
        onRetry={() => profiles.refetch()}
      />
    );
  } else {
    body = (
      <FlatList
        data={profiles.data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProfileCard
            profile={item}
            width={cardWidth}
            height={cardHeight}
            isActive={item.id === activeId}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/profile/${item.id}`);
            }}
          />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          profiles.data.length === 0 && styles.listEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={profiles.isRefetching}
            onRefresh={() => profiles.refetch()}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No one's on the scene yet"
            message={`${cityName} creatives land here as they join. Pull to refresh — or get your profile ready so you're first on the call sheet.`}
          />
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>The {cityName} scene.</Text>
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
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  listEmpty: {
    flexGrow: 1,
  },
});
