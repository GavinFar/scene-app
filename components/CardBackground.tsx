import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Clapperboard } from 'lucide-react-native';

import { colors } from '@/constants/tokens';
import { optimizeImage, optimizeVideo } from '@/lib/cloudinary';
import type { Enums } from '@/types/database';

interface CardBackgroundProps {
  /** Cloudinary publicId of the work/reel asset; placeholder when absent. */
  publicId: string | null;
  mediaType: Enums<'media_type'> | null;
  width: number;
  height: number;
  /** Video plays only while the card is the visible feed item (spec #7). */
  isActive: boolean;
}

/**
 * The work-first card background — fills its parent. Every URL goes through
 * the Cloudinary optimization helpers at the card's dimensions (spec #2).
 */
export function CardBackground({ publicId, mediaType, width, height, isActive }: CardBackgroundProps) {
  if (!publicId || !mediaType) {
    return (
      <View style={[styles.fill, styles.placeholder]}>
        <Clapperboard color={colors.textMuted} size={40} />
      </View>
    );
  }

  if (mediaType === 'video') {
    return <VideoBackground publicId={publicId} width={width} height={height} isActive={isActive} />;
  }

  return (
    <Image
      source={{ uri: optimizeImage(publicId, { width, height }) }}
      style={styles.fill}
      resizeMode="cover"
      accessibilityIgnoresInvertColors
    />
  );
}

interface VideoBackgroundProps {
  publicId: string;
  width: number;
  height: number;
  isActive: boolean;
}

// Private so the video player hook only mounts for actual video cards.
function VideoBackground({ publicId, width, height, isActive }: VideoBackgroundProps) {
  const player = useVideoPlayer(optimizeVideo(publicId, { width, height }), (instance) => {
    instance.loop = true;
    instance.muted = true; // autoplay is muted by default (spec #7)
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  return (
    <VideoView player={player} style={styles.fill} contentFit="cover" nativeControls={false} />
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  placeholder: {
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
