import type { LucideIcon } from 'lucide-react-native';
import { AtSign, Briefcase, Clapperboard, Globe, SquarePlay, Video } from 'lucide-react-native';

/**
 * External-link platforms allowed on a profile's connections tab — trust
 * signals, never required. Keys match the external_links.platform DB check
 * constraint (imdb/vimeo/youtube/instagram/linkedin/website).
 */
export interface LinkPlatform {
  label: string;
  icon: LucideIcon;
}

// lucide 1.x dropped brand glyphs (Instagram/Linkedin/Youtube), so those
// platforms map to logical stand-ins (spec #4: lucide-react-native only).
export const LINK_PLATFORMS: Record<string, LinkPlatform> = {
  imdb: { label: 'IMDb', icon: Clapperboard },
  vimeo: { label: 'Vimeo', icon: Video },
  youtube: { label: 'YouTube', icon: SquarePlay },
  instagram: { label: 'Instagram', icon: AtSign },
  linkedin: { label: 'LinkedIn', icon: Briefcase },
  website: { label: 'Website', icon: Globe },
};

/** Fallback for a platform value the app doesn't know (future-proofing). */
export const UNKNOWN_PLATFORM: LinkPlatform = { label: 'Link', icon: Globe };
