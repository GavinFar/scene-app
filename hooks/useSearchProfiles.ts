import { useQuery } from '@tanstack/react-query';

import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import { useRolesCatalog } from '@/hooks/useRolesCatalog';
import { resolveRoles } from '@/lib/resolveRoles';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { useFiltersStore } from '@/store/filters';
import type { Enums } from '@/types/database';

export interface SearchProfileRole {
  experience: number;
  role: { slug: string; name: string };
}

/** Compact result-row shape — search never needs the card media. */
export interface SearchProfile {
  id: string;
  display_name: string;
  rate_tier: Enums<'rate_tier'> | null;
  face_public_id: string | null;
  city: { id: string; name: string; state: string } | null;
  roles: SearchProfileRole[];
}

/** Common shape of both select branches — what toSearchProfile consumes. */
interface SearchRow {
  id: string;
  display_name: string;
  rate_tier: Enums<'rate_tier'> | null;
  face_public_id: string | null;
  city: { id: string; name: string; state: string } | null;
  roles: { experience: number; role: { slug: string; name: string } | null }[];
}

function toSearchProfile(row: SearchRow): SearchProfile {
  return {
    id: row.id,
    display_name: row.display_name,
    rate_tier: row.rate_tier,
    face_public_id: row.face_public_id,
    city: row.city,
    roles: row.roles
      .flatMap((entry) => (entry.role ? [{ experience: entry.experience, role: entry.role }] : []))
      .sort((a, b) => b.experience - a.experience),
  };
}

// Base select, plus a variant with a second (aliased) profile_roles embed:
// `match` is !inner so role/experience filters drop non-matching profiles,
// while `roles` stays complete for display. Single literals — concatenation
// widens to `string` and supabase-js loses the joined row type.
const SEARCH_SELECT =
  'id, display_name, rate_tier, face_public_id, city:cities(id, name, state), roles:profile_roles(experience, role:roles(slug, name))';
const SEARCH_SELECT_MATCHED =
  'id, display_name, rate_tier, face_public_id, city:cities(id, name, state), roles:profile_roles(experience, role:roles(slug, name)), match:profile_roles!inner(role_slug, experience)';

/**
 * The Search tab's one data source. Reads the filters store and resolves it
 * to a server query: Client mode runs the typed phrase through the synonym
 * map into role slugs (decision #4); Pro / Up & Coming match the phrase
 * against names and role labels instead. Role, department (expanded to its
 * roles), experience, rate-tier, and city filters run server-side.
 */
export function useSearchProfiles() {
  const query = useFiltersStore((state) => state.query);
  const roles = useFiltersStore((state) => state.roles);
  const departments = useFiltersStore((state) => state.departments);
  const cityId = useFiltersStore((state) => state.cityId);
  const minExperience = useFiltersStore((state) => state.minExperience);
  const rateTiers = useFiltersStore((state) => state.rateTiers);

  const userId = useAuthStore((state) => state.session?.user.id);
  const currentProfile = useCurrentProfile();
  const catalog = useRolesCatalog();

  const userMode = currentProfile.data?.user_mode ?? null;
  const phrase = query.trim();

  // Union: explicit role chips + department chips expanded + (client mode)
  // synonym-resolved phrase roles.
  const roleSlugSet = new Set(roles);
  if (departments.length > 0 && catalog.data) {
    for (const department of catalog.data) {
      if (departments.includes(department.slug)) {
        for (const role of department.roles) roleSlugSet.add(role.slug);
      }
    }
  }
  const phraseSlugs = userMode === 'client' && phrase ? resolveRoles(phrase) : [];
  for (const slug of phraseSlugs) roleSlugSet.add(slug);
  const roleSlugs = [...roleSlugSet].sort();

  // A Client phrase that resolves to nothing (and no chips to fall back on)
  // means "no matches", not "everyone".
  const unresolvableClientPhrase =
    userMode === 'client' && Boolean(phrase) && roleSlugs.length === 0;

  // Null city filter = the user's own scene (store contract).
  const effectiveCityId = cityId ?? currentProfile.data?.city_id ?? null;

  // Non-client phrase matches names/role labels — applied client-side after
  // the server-side filters (result sets are city-scoped and small).
  const nameQuery = userMode !== 'client' && phrase ? phrase.toLowerCase() : '';

  return useQuery({
    queryKey: [
      'profiles',
      'search',
      {
        cityId: effectiveCityId,
        excludeProfileId: userId ?? null,
        roleSlugs,
        minExperience,
        rateTiers: [...rateTiers].sort(),
        nameQuery,
        unresolvableClientPhrase,
      },
    ],
    // Wait for profile (user mode + home city) and catalog (dept expansion)
    // so the search runs once, correctly scoped.
    enabled: !currentProfile.isPending && !catalog.isPending,
    queryFn: async (): Promise<SearchProfile[]> => {
      if (unresolvableClientPhrase) return [];

      // Two select branches, not select(a ? x : y) — a union of literals
      // breaks supabase-js's type-level parser.
      const needsMatchEmbed = roleSlugs.length > 0 || minExperience != null;
      let rows: SearchRow[];
      if (needsMatchEmbed) {
        let request = supabase
          .from('profiles')
          .select(SEARCH_SELECT_MATCHED)
          .order('created_at', { ascending: false });
        if (effectiveCityId) request = request.eq('city_id', effectiveCityId);
        if (userId) request = request.neq('id', userId);
        if (rateTiers.length > 0) request = request.in('rate_tier', [...rateTiers]);
        if (roleSlugs.length > 0) request = request.in('match.role_slug', roleSlugs);
        if (minExperience != null) request = request.gte('match.experience', minExperience);
        const { data, error } = await request;
        if (error) throw error;
        rows = data;
      } else {
        let request = supabase
          .from('profiles')
          .select(SEARCH_SELECT)
          .order('created_at', { ascending: false });
        if (effectiveCityId) request = request.eq('city_id', effectiveCityId);
        if (userId) request = request.neq('id', userId);
        if (rateTiers.length > 0) request = request.in('rate_tier', [...rateTiers]);
        const { data, error } = await request;
        if (error) throw error;
        rows = data;
      }

      const results = rows.map(toSearchProfile);
      if (!nameQuery) return results;
      return results.filter(
        (profile) =>
          profile.display_name.toLowerCase().includes(nameQuery) ||
          profile.roles.some(
            (entry) =>
              entry.role.name.toLowerCase().includes(nameQuery) ||
              entry.role.slug.includes(nameQuery)
          )
      );
    },
  });
}
