import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin } from 'lucide-react-native';

import { CardBackground } from '@/components/CardBackground';
import { ExperienceDots } from '@/components/ExperienceDots';
import { RateTier } from '@/components/RateTier';
import { RoleTag } from '@/components/RoleTag';
import { ViewfinderBrackets } from '@/components/ViewfinderBrackets';
import { Avatar } from '@/components/ui/Avatar';
import { colors, radius, spacing, typography } from '@/constants/tokens';
import type { FeedProfile } from '@/hooks/useProfiles';

/** Named badges on the card; anything beyond becomes a "+N" count. */
const MAX_CARD_ROLES = 2;

/**
 * Show experience dots against the lead role.
 *
 * Flip to `false` for the badges-only card — the two layouts differ by this
 * and nothing else, so the choice stays a one-line change rather than a
 * rewrite. Secondary roles never carry dots on the card either way; their
 * experience lives in the detail sheet.
 */
const SHOW_LEAD_EXPERIENCE = true;

/**
 * Scrim ramp, built from the ground colour so it stays palette-derived.
 * A flat rectangle leaves a visible horizontal seam across the artwork; easing
 * the alpha instead means the overlay has no edge to notice.
 */
const SCRIM_COLORS = [
  `${colors.background}00`,
  `${colors.background}8C`,
  `${colors.background}E6`,
  colors.background,
] as const;
const SCRIM_STOPS = [0, 0.38, 0.72, 1] as const;

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
 * The work-first card: work/reel fills the background, identity stacked at the
 * lower left, and a single role line beneath it.
 *
 * Identity stacks rather than splitting into two columns so the role line gets
 * the card's full width — badges read left to right there, where the old
 * right-hand column was too narrow for them. Three stacked dot-and-badge rows
 * covered roughly half the artwork; this covers a third of it.
 */
export function ProfileCard({ profile, width, height, isActive, onPress }: ProfileCardProps) {
  const [leadRole] = profile.roles;
  const namedRoles = profile.roles.slice(0, MAX_CARD_ROLES);
  const overflowCount = profile.roles.length - namedRoles.length;

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
      <LinearGradient
        colors={SCRIM_COLORS}
        locations={SCRIM_STOPS}
        pointerEvents="none"
        style={styles.scrim}
      />
      <ViewfinderBrackets isActive={isActive} />
      <View style={styles.footer}>
        <Avatar
          publicId={profile.face_public_id}
          name={profile.display_name}
          size={48}
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

        <View style={styles.roleLine}>
          <View style={styles.roles}>
            {SHOW_LEAD_EXPERIENCE && leadRole ? (
              <ExperienceDots experience={leadRole.experience} size={6} />
            ) : null}
            {namedRoles.map((entry, index) => (
              <RoleTag
                key={entry.role.slug}
                slug={entry.role.slug}
                name={entry.role.name}
                tone={index === 0 ? 'lead' : 'neutral'}
                compact
              />
            ))}
            {overflowCount > 0 ? (
              <Text style={styles.overflow}>+{overflowCount}</Text>
            ) : null}
          </View>
          {profile.rate_tier ? <RateTier tier={profile.rate_tier} /> : null}
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
    left: 0,
    right: 0,
    bottom: 0,
    // Runs above the footer so the ramp has room to reach transparent. Shorter
    // than the old overlay because the footer itself is now a third the height.
    height: '38%',
  },
  name: {
    ...typography.lg,
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
  roleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  roles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    // Badges are abbreviations, so clipping beats wrapping to a second line.
    flexShrink: 1,
    overflow: 'hidden',
  },
  overflow: {
    ...typography.mono,
    color: colors.textMuted,
  },
});
