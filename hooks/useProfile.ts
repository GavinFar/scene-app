import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Enums } from '@/types/database';

export interface ProfileRole {
  experience: number;
  role: { slug: string; name: string; department_slug: string };
}

export interface PortfolioItem {
  id: string;
  public_id: string;
  media_type: Enums<'media_type'>;
  caption: string | null;
  sort_order: number;
}

export interface ExternalLink {
  id: string;
  platform: string;
  url: string;
}

export interface ProfileReview {
  id: string;
  kind: Enums<'review_kind'>;
  rating: number | null;
  body: string;
  created_at: string;
  author: { id: string; display_name: string; face_public_id: string | null } | null;
}

/** Everything the detail sheet renders — one fetch per profile. */
export interface ProfileDetail {
  id: string;
  display_name: string;
  bio: string | null;
  user_mode: Enums<'user_mode'>;
  rate_tier: Enums<'rate_tier'> | null;
  work_public_id: string | null;
  work_media_type: Enums<'media_type'> | null;
  face_public_id: string | null;
  city: { id: string; name: string; state: string } | null;
  roles: ProfileRole[];
  portfolio: PortfolioItem[];
  links: ExternalLink[];
  reviews: ProfileReview[];
}

// reviews_and_recommendations carries two FKs to profiles (author + subject),
// so both hops disambiguate via explicit FK constraint names. Single literal —
// concatenation widens to `string` and supabase-js loses the joined row type.
const PROFILE_DETAIL_SELECT =
  'id, display_name, bio, user_mode, rate_tier, work_public_id, work_media_type, face_public_id, city:cities(id, name, state), roles:profile_roles(experience, role:roles(slug, name, department_slug)), portfolio:portfolio_media(id, public_id, media_type, caption, sort_order), links:external_links(id, platform, url), reviews:reviews_and_recommendations!reviews_and_recommendations_subject_profile_id_fkey(id, kind, rating, body, created_at, author:profiles!reviews_and_recommendations_author_profile_id_fkey(id, display_name, face_public_id))';

/**
 * One profile with everything the detail sheet needs. Nested collections are
 * ordered client-side — nested PostgREST order with aliased embeds is not
 * trustworthy (slice-4 lesson).
 */
export function useProfile(profileId: string | undefined) {
  return useQuery({
    queryKey: ['profiles', 'detail', profileId ?? null],
    enabled: Boolean(profileId),
    queryFn: async (): Promise<ProfileDetail | null> => {
      if (!profileId) throw new Error('useProfile ran without a profile id');
      const { data, error } = await supabase
        .from('profiles')
        .select(PROFILE_DETAIL_SELECT)
        .eq('id', profileId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        roles: data.roles
          .flatMap((entry) => (entry.role ? [{ experience: entry.experience, role: entry.role }] : []))
          .sort((a, b) => b.experience - a.experience),
        portfolio: [...data.portfolio].sort((a, b) => a.sort_order - b.sort_order),
        reviews: [...data.reviews].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
      };
    },
  });
}
