import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';

import { BioSheet } from '@/components/BioSheet';
import { CardBackground } from '@/components/CardBackground';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, radius, spacing } from '@/constants/tokens';
import { useProfile } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/auth';

/**
 * Where the loading placeholder sits. Deliberately *not* BioSheet's
 * MEDIA_PEEK_RATIO: the real sheet rests below the fold, and there is no work
 * media to peek at yet while the profile is still loading, so anchoring the
 * skeleton to that ratio would push it off-screen and leave a blank screen.
 */
const SKELETON_TOP_RATIO = 0.52;

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const currentUserId = useAuthStore((state) => state.session?.user.id);
  const profile = useProfile(id);

  // Driven by the BioSheet's scroll; dims and parallaxes the media behind it.
  // Shared values only — no React state in the transition (spec #1).
  const scrollY = useSharedValue(0);
  const mediaStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, height * 0.5], [1, 0.25], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [0, height * 0.5], [0, -height * 0.15], Extrapolation.CLAMP) },
    ],
  }));

  const close = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  let body: React.ReactNode;
  if (profile.isPending) {
    body = (
      <View style={[styles.skeletonSheet, { top: Math.round(height * SKELETON_TOP_RATIO) }]}>
        <Skeleton style={styles.skeletonName} />
        <Skeleton style={styles.skeletonLine} />
        <Skeleton style={styles.skeletonLine} />
        <Skeleton style={styles.skeletonBlock} />
      </View>
    );
  } else if (profile.isError) {
    body = (
      <ErrorState
        title="Couldn't load this profile"
        message="We couldn't reach the network. Check your connection and try again."
        onRetry={() => profile.refetch()}
      />
    );
  } else if (!profile.data) {
    body = (
      <EmptyState
        title="This profile isn't on Scene"
        message="It may have been removed. Head back and keep browsing the scene."
      >
        <Button label="Go back" variant="secondary" onPress={close} />
      </EmptyState>
    );
  } else {
    const detail = profile.data;
    body = (
      <>
        <Animated.View style={[StyleSheet.absoluteFill, mediaStyle]}>
          <CardBackground
            publicId={detail.work_public_id}
            mediaType={detail.work_media_type}
            width={width}
            height={height}
            isActive
          />
        </Animated.View>
        <BioSheet profile={detail} scrollY={scrollY}>
          {currentUserId && currentUserId !== detail.id ? (
            <View style={styles.actions}>
              <Button
                label="Message"
                accessibilityLabel={`Message ${detail.display_name}`}
                onPress={() => router.push(`/messages/${detail.id}`)}
                style={styles.action}
              />
              <Button
                label="Review"
                variant="secondary"
                accessibilityLabel={`Review ${detail.display_name}`}
                onPress={() => router.push(`/review/${detail.id}`)}
                style={styles.action}
              />
            </View>
          ) : null}
        </BioSheet>
      </>
    );
  }

  return (
    <View style={styles.screen}>
      {body}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close profile"
        onPress={close}
        style={({ pressed }) => [
          styles.closeButton,
          { top: insets.top + spacing.sm },
          pressed && styles.closePressed,
        ]}
      >
        <X color={colors.text} size={22} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  closeButton: {
    position: 'absolute',
    left: spacing.lg,
    width: 44, // accessibility floor (spec #14)
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closePressed: {
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  action: {
    flex: 1,
  },
  skeletonSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  skeletonName: {
    width: '55%',
    height: 28,
  },
  skeletonLine: {
    width: '80%',
    height: 14,
  },
  skeletonBlock: {
    width: '100%',
    height: 160,
  },
});
