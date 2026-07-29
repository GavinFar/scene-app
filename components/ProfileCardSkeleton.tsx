import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/ui/Skeleton';
import { colors, radius, spacing } from '@/constants/tokens';

interface ProfileCardSkeletonProps {
  width: number;
  height: number;
}

/**
 * Loading placeholder mirroring the ProfileCard footer layout (spec #12) —
 * the block sizes approximate the avatar, name, city, and role rows.
 */
export function ProfileCardSkeleton({ width, height }: ProfileCardSkeletonProps) {
  return (
    <View style={[styles.card, { width, height }]}>
      <View style={styles.footer}>
        <View style={styles.identity}>
          <Skeleton style={styles.face} />
          <Skeleton style={styles.name} />
          <Skeleton style={styles.city} />
        </View>
        <View style={styles.work}>
          <Skeleton style={styles.roleRow} />
          <Skeleton style={styles.roleRow} />
          <Skeleton style={styles.roleRow} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  identity: {
    gap: spacing.sm,
  },
  face: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
  },
  name: {
    width: 140,
    height: 22,
  },
  city: {
    width: 90,
    height: 14,
  },
  work: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  roleRow: {
    width: 110,
    height: 18,
  },
});
