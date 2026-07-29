import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '@/constants/tokens';
import { optimizeImage } from '@/lib/cloudinary';

interface AvatarProps {
  /** Cloudinary publicId of the face photo; initials fallback when absent. */
  publicId?: string | null;
  /** Display name — drives the initials fallback. */
  name: string;
  size?: number;
  /** White ring for legibility when the avatar sits on media. */
  bordered?: boolean;
}

/** Circular face photo, Cloudinary-optimized at its rendered size (spec #2). */
export function Avatar({ publicId, name, size = 48, bordered = false }: AvatarProps) {
  const shape = { width: size, height: size, borderRadius: radius.full };

  if (!publicId) {
    return (
      <View style={[shape, styles.fallback, bordered && styles.ring]}>
        {/* 0.38 keeps two initials comfortably inside the circle at any size. */}
        <Text style={[styles.initials, { fontSize: Math.round(size * 0.38) }]}>
          {initialsOf(name)}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: optimizeImage(publicId, { width: size, height: size }) }}
      style={[shape, bordered && styles.ring]}
      resizeMode="cover"
      accessibilityIgnoresInvertColors
    />
  );
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderWidth: 2,
    borderColor: colors.text,
  },
  initials: {
    fontFamily: fonts.semibold,
    color: colors.text,
  },
});
