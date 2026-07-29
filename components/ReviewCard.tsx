import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { colors, radius, spacing, typography } from '@/constants/tokens';
import { formatRelativeTime } from '@/lib/dates';
import type { ProfileReview } from '@/hooks/useProfile';

const MAX_RATING = 5;

interface ReviewCardProps {
  review: ProfileReview;
}

/**
 * One review or employer recommendation on the detail sheet. Reviews carry a
 * 1–5 rating; recommendations render a badge instead (schema: rating is NULL
 * exactly when kind = 'recommendation').
 */
export function ReviewCard({ review }: ReviewCardProps) {
  const authorName = review.author?.display_name ?? 'Scene member';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar publicId={review.author?.face_public_id} name={authorName} size={32} />
        <View style={styles.headerText}>
          <Text style={styles.author} numberOfLines={1}>
            {authorName}
          </Text>
          <Text style={styles.time}>{formatRelativeTime(review.created_at)}</Text>
        </View>
        {review.kind === 'review' && review.rating != null ? (
          <Rating rating={review.rating} />
        ) : (
          <Badge label="RECOMMENDED" tone="accent" />
        )}
      </View>
      <Text style={styles.body}>{review.body}</Text>
    </View>
  );
}

function Rating({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(MAX_RATING, Math.round(rating)));

  return (
    <Text
      accessible
      accessibilityLabel={`Rated ${filled} of ${MAX_RATING}`}
      style={styles.stars}
    >
      {'★'.repeat(filled)}
      <Text style={styles.starsGhost}>{'★'.repeat(MAX_RATING - filled)}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  author: {
    ...typography.md,
    color: colors.text,
  },
  time: {
    ...typography.xs,
    color: colors.textMuted,
  },
  stars: {
    ...typography.mono,
    color: colors.accent,
  },
  starsGhost: {
    color: colors.border,
  },
  body: {
    ...typography.base,
    color: colors.text,
  },
});
