import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ExperienceDots } from '@/components/ExperienceDots';
import { RateTier } from '@/components/RateTier';
import { RoleTag } from '@/components/RoleTag';
import { Avatar } from '@/components/ui/Avatar';
import { colors, radius, spacing, typography } from '@/constants/tokens';
import type { SearchProfile } from '@/hooks/useSearchProfiles';

/** Rows are compact — the detail sheet holds the full role list. */
const MAX_ROW_ROLES = 2;

interface ResultRowProps {
  profile: SearchProfile;
  onPress: () => void;
}

/** Compact search result: face, name, strongest roles, rate tier. */
export function ResultRow({ profile, onPress }: ResultRowProps) {
  const roles = profile.roles.slice(0, MAX_ROW_ROLES);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${profile.display_name} — open profile`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Avatar publicId={profile.face_public_id} name={profile.display_name} size={48} />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {profile.display_name}
        </Text>
        {profile.city ? (
          <Text style={styles.city} numberOfLines={1}>
            {profile.city.name}, {profile.city.state}
          </Text>
        ) : null}
        {roles.length > 0 ? (
          <View style={styles.roles}>
            {roles.map((entry) => (
              <View key={entry.role.slug} style={styles.roleItem}>
                <RoleTag slug={entry.role.slug} name={entry.role.name} compact />
                <ExperienceDots experience={entry.experience} size={5} />
              </View>
            ))}
          </View>
        ) : null}
      </View>
      {profile.rate_tier ? <RateTier tier={profile.rate_tier} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44, // accessibility floor (spec #14)
  },
  pressed: {
    opacity: 0.7,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...typography.md,
    color: colors.text,
  },
  city: {
    ...typography.xs,
    color: colors.textMuted,
  },
  roles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
