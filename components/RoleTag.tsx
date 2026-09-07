import type { StyleProp, ViewStyle } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import type { ComponentProps } from 'react';

interface RoleTagProps {
  /** Role slug — fallback label source when no name is supplied. */
  slug: string;
  /** Display name from the roles table, e.g. "Director of Photography (DP)". */
  name?: string | null;
  /**
   * Card-sized label: prefers the parenthetical abbreviation ("DP") when the
   * role name carries one, otherwise the name minus any parenthetical.
   */
  compact?: boolean;
  /** `lead` marks the role the profile leads with. */
  tone?: ComponentProps<typeof Badge>['tone'];
  style?: StyleProp<ViewStyle>;
}

/** Role slug → display-label badge. */
export function RoleTag({ slug, name, compact = false, tone, style }: RoleTagProps) {
  return <Badge label={roleLabel(slug, name, compact)} tone={tone} style={style} />;
}

function roleLabel(slug: string, name: string | null | undefined, compact: boolean): string {
  const full = name ?? titleCaseSlug(slug);
  if (!compact) return full;
  const abbreviation = full.match(/\(([^)]+)\)/)?.[1];
  return abbreviation ?? full.replace(/\s*\([^)]*\)/, '').trim();
}

/** "key-grip" → "Key Grip" — only used when the DB name isn't joined in. */
function titleCaseSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => (word[0]?.toUpperCase() ?? '') + word.slice(1))
    .join(' ');
}
