import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MapPin } from 'lucide-react-native';

import { CardBackground } from '@/components/CardBackground';
import { ExperienceDots } from '@/components/ExperienceDots';
import { RateTier } from '@/components/RateTier';
import { RoleTag } from '@/components/RoleTag';
import { Avatar } from '@/components/ui/Avatar';
import { colors, radius, spacing, typography } from '@/constants/tokens';
import type { FeedProfile } from '@/hooks/useProfiles';

/** Card shows at most this many role rows — the rest live in the detail sheet. */
const MAX_CARD_ROLES = 3;

interface ProfileCardProps {
  profile: FeedProfile;
  width: number;
  height: number;
  /** True while this card is the visible feed item — drives video autoplay. */
  isActive: boolean;
  /** Slice 5 wires this to the profile detail sheet. */
  onPress?: () => void;
}

/**
 * The work-first card (spec layout): work/reel fills the background, face
 * photo lower-left, role rows with experience dots to its right, name and
 * city under the face, rate tier bottom-right.
 */
export function ProfileCard({ profile, width, height, isActive, onPress }: ProfileCardProps) {
  const roles = profile.roles.slice(0, MAX_CARD_ROLES);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${profile.display_name} — open profile`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { width, height }, pressed && styles.pressed]}
    >
      <CardBackground
        publicId={profile.work_public_id}
        mediaType={profile.work_media_type}
        width={width}
        height={height}
        isActive={isActive}
      />
      <View style={styles.footer}>
        <View style={styles.scrim} pointerEvents="none" />
        <View style={styles.footerRow}>
          <View style={styles.identity}>
            <Avatar
              publicId={profile.face_public_id}
              name={profile.display_name}
              size={64}
              bordered
            />
            <Text style={styles.name} numberOfLines={1}>
              {profile.display_name}
            </Text>
            {profile.city ? (
              <View style={styles.cityRow}>
                <MapPin color={colors.textMuted} size={12} />
                <Text style={styles.city} numberOfLines={1}>
                  {profile.city.name}, {profile.city.state}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.work}>
            {roles.map((entry) => (
              <View key={entry.role.slug} style={styles.roleRow}>
                <ExperienceDots experience={entry.experience} />
                <RoleTag slug={entry.role.slug} name={entry.role.name} compact />
              </View>
            ))}
            {profile.rate_tier ? (
              <View style={styles.rate}>
                <RateTier tier={profile.rate_tier} />
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    // Surface behind the media while it loads — no white flash, no shift.
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.85,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    // Translucent panel keeps the overlay text legible on any media.
    opacity: 0.55,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  identity: {
    flexShrink: 1,
    gap: spacing.xs,
  },
  name: {
    ...typography.xl,
    color: colors.text,
    marginTop: spacing.sm,
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
  work: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rate: {
    marginTop: spacing.xs,
  },
});
