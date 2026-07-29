import { Dimensions, PixelRatio } from 'react-native';

const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;

if (!cloudName) {
  throw new Error(
    'Missing EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME — check .env and restart the dev server.'
  );
}

// q_auto at 2x is visually indistinguishable from 3x on phones at roughly
// half the bytes.
const MAX_DPR = 2;

export interface MediaSize {
  width?: number;
  height?: number;
}

function buildUrl(
  resourceType: 'image' | 'video',
  publicId: string,
  size?: MediaSize
): string {
  const windowSize = Dimensions.get('window');
  const width = Math.round(size?.width ?? windowSize.width);
  const height = Math.round(size?.height ?? windowSize.height);
  const dpr = Math.min(PixelRatio.get(), MAX_DPR);
  const transformation = `f_auto,q_auto,c_fill,w_${width},h_${height},dpr_${dpr}`;
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${transformation}/${publicId}`;
}

/**
 * Optimized delivery URL for a Cloudinary image publicId — applies
 * f_auto,q_auto,c_fill at the given (default: full-window) dimensions.
 * Every image rendered in a feed background must pass through this (spec #2).
 */
export function optimizeImage(publicId: string, size?: MediaSize): string {
  return buildUrl('image', publicId, size);
}

/**
 * Optimized delivery URL for a Cloudinary video publicId — same contract as
 * optimizeImage (spec #2).
 */
export function optimizeVideo(publicId: string, size?: MediaSize): string {
  return buildUrl('video', publicId, size);
}

/**
 * Still-frame poster (JPEG) for a Cloudinary video publicId — used where a
 * grid tile shouldn't mount a video player (e.g. portfolio thumbnails).
 * Same f_auto→f_jpg optimization contract as the other helpers (spec #2).
 */
export function optimizeVideoPoster(publicId: string, size?: MediaSize): string {
  return buildUrl('video', publicId, size).replace('f_auto', 'f_jpg') + '.jpg';
}
