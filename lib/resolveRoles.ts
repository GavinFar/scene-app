import { ROLE_SYNONYMS } from '@/constants/roleSynonyms';

/**
 * Client-mode phrase → role slugs (locked decision #4): match the typed
 * phrase against the curated synonym map and union every hit. "someone to
 * film and edit a video" → dp, camera-operator, editor.
 *
 * Multi-word keys match as substrings of the whole phrase; single-word keys
 * match on word stems in either direction ("film" catches "filming",
 * "colors" catches "color"). Returns [] when nothing matches — the caller
 * decides what an unresolvable phrase means.
 */
export function resolveRoles(phrase: string): string[] {
  const normalized = normalizePhrase(phrase);
  if (!normalized) return [];
  const words = normalized.split(' ');

  const matched = new Set<string>();
  for (const [key, slugs] of Object.entries(ROLE_SYNONYMS)) {
    const isHit = key.includes(' ')
      ? normalized.includes(key)
      : words.some((word) => stemsMatch(word, key));
    if (isHit) {
      for (const slug of slugs) matched.add(slug);
    }
  }
  return [...matched];
}

/** Lowercase, strip punctuation, collapse whitespace. */
function normalizePhrase(phrase: string): string {
  return phrase
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Stem-ish prefix match: the typed word may extend the key ("filming"
 * matches "film") but never the reverse — "make" must not match "makeup".
 * Keys need 3+ chars before the fuzz so short words only match exactly.
 */
function stemsMatch(word: string, key: string): boolean {
  if (word === key) return true;
  if (key.length < 3) return false;
  return word.startsWith(key);
}
