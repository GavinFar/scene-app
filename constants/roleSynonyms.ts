/**
 * Curated natural-language phrase → role-slug map (locked decision #4).
 * Client mode runs the typed search phrase through this map (contains/fuzzy
 * match in lib/resolveRoles.ts), unions the matched slugs, then applies the
 * normal role filter. Pro and Up & Coming modes skip it.
 *
 * Keys are lowercase. Single-word keys match on word stems ("film" catches
 * "filming"); multi-word keys match as phrases. Slugs are verified against
 * the live roles table — never invent one here.
 */
export const ROLE_SYNONYMS: Record<string, readonly string[]> = {
  // Camera / shooting
  film: ['dp', 'camera-operator'],
  shoot: ['dp', 'camera-operator'],
  camera: ['dp', 'camera-operator', 'first-ac', 'second-ac'],
  video: ['dp', 'camera-operator', 'editor'],
  videographer: ['dp', 'camera-operator'],
  cinematic: ['dp', 'colorist', 'gaffer'],
  cinematographer: ['dp'],
  drone: ['camera-operator', 'dp'],
  footage: ['dp', 'camera-operator'],

  // Post production
  edit: ['editor'],
  cut: ['editor'],
  color: ['colorist'],
  grade: ['colorist'],
  grading: ['colorist'],
  vfx: ['vfx-artist'],
  effects: ['vfx-artist'],
  animation: ['motion-graphics'],
  motion: ['motion-graphics'],
  graphics: ['motion-graphics'],
  titles: ['motion-graphics'],

  // Lighting / grip
  light: ['gaffer', 'best-boy-electric'],
  lighting: ['gaffer', 'best-boy-electric'],
  grip: ['key-grip', 'best-boy-grip', 'swing'],
  rigging: ['key-grip', 'gaffer'],

  // Sound
  sound: ['production-sound-mixer', 'boom-operator', 'sound-designer'],
  audio: ['production-sound-mixer', 'sound-editor'],
  mic: ['production-sound-mixer', 'boom-operator'],
  mixing: ['production-sound-mixer', 'sound-editor'],

  // Directing / production
  direct: ['director'],
  organize: ['producer', 'production-coordinator'],
  produce: ['producer'],
  budget: ['line-producer', 'producer'],
  manage: ['production-manager', 'producer'],
  coordinate: ['production-coordinator'],
  crew: ['production-manager', 'production-coordinator', 'pa'],

  // Design / look
  props: ['props-master'],
  'set design': ['production-designer', 'set-decorator', 'art-director'],
  'set dressing': ['set-decorator'],
  wardrobe: ['costume-designer', 'wardrobe-stylist'],
  costume: ['costume-designer', 'wardrobe-stylist'],
  makeup: ['key-makeup-artist'],
  hair: ['key-hair-stylist'],

  // Locations / casting / stunts
  location: ['location-manager', 'location-scout'],
  scout: ['location-scout'],
  casting: ['casting-director'],
  actor: ['talent'],
  actress: ['talent'],
  talent: ['talent', 'casting-director'],
  stunt: ['stunt-coordinator', 'stunt-performer'],

  // Common client project phrases
  'music video': ['dp', 'editor', 'colorist'],
  commercial: ['dp', 'editor', 'producer'],
  promo: ['dp', 'editor', 'motion-graphics'],
  documentary: ['dp', 'editor', 'production-sound-mixer'],
  wedding: ['dp', 'camera-operator', 'editor'],
  interview: ['dp', 'production-sound-mixer', 'editor'],
  'short film': ['director', 'dp', 'producer'],
};
