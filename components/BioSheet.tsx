import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedScrollHandler } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { MapPin } from 'lucide-react-native';

import { ConnectionBadge } from '@/components/ConnectionBadge';
import { ExperienceDots } from '@/components/ExperienceDots';
import { PortfolioGrid } from '@/components/PortfolioGrid';
import { RateTier } from '@/components/RateTier';
import { ReviewCard } from '@/components/ReviewCard';
import { RoleTag } from '@/components/RoleTag';
import { colors, radius, spacing, typography } from '@/constants/tokens';
import type { ProfileDetail } from '@/hooks/useProfile';

/** Share of the viewport the work media keeps before the sheet begins. */
const MEDIA_PEEK_RATIO = 0.52;

/** Sheet gutter — PortfolioGrid needs it to size tiles exactly. */
const SHEET_PADDING = spacing.xl;

interface BioSheetProps {
  profile: ProfileDetail;
  /**
   * Scroll progress shared with the route, which uses it to dim/parallax the
   * work media behind the sheet. All layout animation stays on reanimated
   * shared values — no React state (spec #1).
   */
  scrollY: SharedValue<number>;
  /** Optional action row (e.g. the Message CTA) pinned under the header. */
  children?: React.ReactNode;
}

/**
 * The scrolling bio sheet over the fullscreen work media: identity header,
 * bio, connections, portfolio grid, reviews & recommendations.
 *
 * Renders at rest — no entrance transition. The sheet previously sprang up a
 * quarter of the viewport on mount, which delayed the content behind an
 * animation on every profile open.
 */
export function BioSheet({ profile, scrollY, children }: BioSheetProps) {
  const { height } = useWindowDimensions();

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const reviews = profile.reviews.filter((entry) => entry.kind === 'review');
  const recommendations = profile.reviews.filter((entry) => entry.kind === 'recommendation');
  const hasContent =
    Boolean(profile.bio) ||
    profile.links.length > 0 ||
    profile.portfolio.length > 0 ||
    profile.reviews.length > 0;

  return (
    <Animated.ScrollView
      style={StyleSheet.absoluteFill}
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      {/* Transparent spacer — the work media shows through until you scroll. */}
      <View style={{ height: Math.round(height * MEDIA_PEEK_RATIO) }} pointerEvents="none" />

      <View style={[styles.sheet, { minHeight: height }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <View style={styles.identity}>
            <Text style={styles.name}>{profile.display_name}</Text>
            {profile.city ? (
              <View style={styles.cityRow}>
                <MapPin color={colors.textMuted} size={14} />
                <Text style={styles.city}>
                  {profile.city.name}, {profile.city.state}
                </Text>
              </View>
            ) : null}
          </View>
          {profile.rate_tier ? <RateTier tier={profile.rate_tier} /> : null}
        </View>

        {profile.roles.length > 0 ? (
          <View style={styles.roles}>
            {profile.roles.map((entry) => (
              <View key={entry.role.slug} style={styles.roleRow}>
                <RoleTag slug={entry.role.slug} name={entry.role.name} />
                <ExperienceDots experience={entry.experience} />
              </View>
            ))}
          </View>
        ) : null}

        {children}

        {profile.bio ? (
          <Section title="About">
            <Text style={styles.bio}>{profile.bio}</Text>
          </Section>
        ) : null}

        {profile.links.length > 0 ? (
          <Section title="Connections">
            <View style={styles.links}>
              {profile.links.map((link) => (
                <ConnectionBadge key={link.id} platform={link.platform} url={link.url} />
              ))}
            </View>
          </Section>
        ) : null}

        {profile.portfolio.length > 0 ? (
          <Section title="Portfolio">
            <PortfolioGrid items={profile.portfolio} horizontalPadding={SHEET_PADDING} />
          </Section>
        ) : null}

        {reviews.length > 0 ? (
          <Section title={`Reviews (${reviews.length})`}>
            <View style={styles.reviewList}>
              {reviews.map((entry) => (
                <ReviewCard key={entry.id} review={entry} />
              ))}
            </View>
          </Section>
        ) : null}

        {recommendations.length > 0 ? (
          <Section title={`Recommendations (${recommendations.length})`}>
            <View style={styles.reviewList}>
              {recommendations.map((entry) => (
                <ReviewCard key={entry.id} review={entry} />
              ))}
            </View>
          </Section>
        ) : null}

        {!hasContent ? (
          <Text style={styles.emptyNote}>
            {profile.display_name} hasn't filled out their profile yet — their work speaks first.
          </Text>
        ) : null}
      </View>
    </Animated.ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: SHEET_PADDING,
    gap: spacing['2xl'],
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  identity: {
    flexShrink: 1,
    gap: spacing.xs,
  },
  name: {
    ...typography.xl,
    color: colors.text,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  city: {
    ...typography.sm,
    color: colors.textMuted,
  },
  roles: {
    gap: spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.lg,
    color: colors.text,
  },
  bio: {
    ...typography.base,
    color: colors.text,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  reviewList: {
    gap: spacing.md,
  },
  emptyNote: {
    ...typography.base,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing['2xl'],
  },
});
