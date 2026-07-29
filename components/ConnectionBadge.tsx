import { Alert, Linking, Pressable, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

import { LINK_PLATFORMS, UNKNOWN_PLATFORM } from '@/constants/linkPlatforms';
import { colors, radius, spacing, typography } from '@/constants/tokens';

interface ConnectionBadgeProps {
  platform: string;
  url: string;
}

/**
 * External-link badge (IMDb, Vimeo, Instagram…) on the detail sheet's
 * connections row — opens the URL in the system browser.
 */
export function ConnectionBadge({ platform, url }: ConnectionBadgeProps) {
  const { label, icon: Icon } = LINK_PLATFORMS[platform] ?? UNKNOWN_PLATFORM;

  const handlePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Couldn't open link", 'The link may be broken — try again later.');
    }
  };

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Open ${label}`}
      onPress={handlePress}
      style={({ pressed }) => [styles.badge, pressed && styles.pressed]}
    >
      <Icon color={colors.text} size={16} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44, // accessibility floor (spec #14)
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    ...typography.mono,
    color: colors.text,
  },
});
