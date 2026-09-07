import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/ui/Skeleton';
import { colors, radius, spacing } from '@/constants/tokens';

interface ProfileCardSkeletonProps {
  width: number;
  height: number;
}

/**
 * Loading placeholder mirroring the ProfileCard footer — block sizes track the
 * avatar, name, city and the single role line. Keep these in step with
 * ProfileCard's layout or the card visibly jumps when real data lands.
 */
export function ProfileCardSkeleton({ width, height }: ProfileCardSkeletonProps) {
  return (
    <View style={[styles.card, { width, height }]}>
      <View style={styles.footer}>
        <Skeleton style={styles.face} />
        <Skeleton style={styles.name} />
        <Skeleton style={styles.city} />
        <View style={styles.roleLine}>
          <Skeleton style={styles.roleBadge} />
          <Skeleton style={styles.roleBadge} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  face: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
  },
  name: {
    width: 140,
    height: 20,
    marginTop: spacing.sm,
  },
  city: {
    width: 90,
    height: 14,
  },
  roleLine: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  roleBadge: {
    width: 54,
    height: 18,
  },
});
