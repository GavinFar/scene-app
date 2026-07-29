import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Play } from 'lucide-react-native';

import { colors, radius, spacing, typography } from '@/constants/tokens';
import { optimizeImage, optimizeVideoPoster } from '@/lib/cloudinary';
import type { PortfolioItem } from '@/hooks/useProfile';

const COLUMNS = 2;
const TILE_ASPECT = 4 / 5; // portrait tiles read as "work", not thumbnails

interface PortfolioGridProps {
  items: PortfolioItem[];
  /** Horizontal padding around the grid — needed to size tiles exactly. */
  horizontalPadding: number;
}

/**
 * Two-column grid of portfolio media. Videos render a Cloudinary still-frame
 * poster with a play glyph — the detail sheet already autoplays the hero reel;
 * grid tiles stay lightweight. Lives inside the BioSheet scroll, so it maps
 * rows itself rather than nesting a FlatList.
 */
export function PortfolioGrid({ items, horizontalPadding }: PortfolioGridProps) {
  const { width } = useWindowDimensions();
  const tileWidth = (width - horizontalPadding * 2 - spacing.md * (COLUMNS - 1)) / COLUMNS;
  const tileHeight = Math.round(tileWidth / TILE_ASPECT);

  return (
    <View style={styles.grid}>
      {items.map((item) => {
        const size = { width: Math.round(tileWidth), height: tileHeight };
        const uri =
          item.media_type === 'video'
            ? optimizeVideoPoster(item.public_id, size)
            : optimizeImage(item.public_id, size);

        return (
          <View key={item.id} style={[styles.tile, { width: tileWidth, height: tileHeight }]}>
            <Image
              source={{ uri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
            {item.media_type === 'video' ? (
              <View style={styles.playWrap} accessible accessibilityLabel="Video">
                <Play color={colors.text} size={18} fill={colors.text} />
              </View>
            ) : null}
            {item.caption ? (
              <View style={styles.captionWrap}>
                <Text style={styles.caption} numberOfLines={1}>
                  {item.caption}
                </Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tile: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceRaised,
  },
  playWrap: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    opacity: 0.85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    opacity: 0.9,
  },
  caption: {
    ...typography.xs,
    color: colors.text,
  },
});
