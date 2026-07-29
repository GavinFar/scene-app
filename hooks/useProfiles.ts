import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Enums } from '@/types/database';

export interface FeedProfileRole {
  experience: number;
  role: { slug: string; name: string };
}

/** Exactly what a ProfileCard needs — one source of truth for the feed shape. */
export interface FeedProfile {
  id: string;
  display_name: string;
  rate_tier: Enums<'rate_tier'> | null;
  work_public_id: string | null;
  work_media_type: Enums<'media_type'> | null;
  face_public_id: string | null;
  city: { id: string; name: string; state: string } | null;
  roles: FeedProfileRole[];
}

// Single literal so supabase-js can infer the joined row type.
const FEED_SELECT =
  'id, display_name, rate_tier, work_public_id, work_media_type, face_public_id, city:cities(id, name, state), roles:profile_roles(experience, role:roles(slug, name))';

export interface UseProfilesOptions {
  /** Scope the feed to one city (local-first). Null = all cities. */
  cityId?: string | null;
  /** Keep the signed-in user's own card out of their browse feed. */
  excludeProfileId?: string | null;
  enabled?: boolean;
}

/** Profiles for the Home feed, newest first, strongest roles first per card. */
export function useProfiles({ cityId, excludeProfileId, enabled = true }: UseProfilesOptions = {}) {
  return useQuery({
    queryKey: [
      'profiles',
      'feed',
      { cityId: cityId ?? null, excludeProfileId: excludeProfileId ?? null },
    ],
    enabled,
    queryFn: async (): Promise<FeedProfile[]> => {
      let query = supabase
        .from('profiles')
        .select(FEED_SELECT)
        .order('created_at', { ascending: false });
      if (cityId) {
        query = query.eq('city_id', cityId);
      }
      if (excludeProfileId) {
        query = query.neq('id', excludeProfileId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map((row) => ({
        ...row,
        roles: row.roles
          .flatMap((entry) => (entry.role ? [{ experience: entry.experience, role: entry.role }] : []))
          .sort((a, b) => b.experience - a.experience),
      }));
    },
  });
}
