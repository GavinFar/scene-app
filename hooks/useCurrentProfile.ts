import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import type { Enums } from '@/types/database';

export interface CurrentProfile {
  id: string;
  display_name: string;
  bio: string | null;
  user_mode: Enums<'user_mode'>;
  rate_tier: Enums<'rate_tier'> | null;
  city_id: string;
  work_public_id: string | null;
  work_media_type: Enums<'media_type'> | null;
  face_public_id: string | null;
  city: { id: string; name: string; state: string } | null;
}

/**
 * The signed-in user's own profile row — null until ensureProfile has created
 * it (confirm-email signups have a window where it doesn't exist yet). Shared
 * by the Home header (city scoping), the Profile tab, and edit-profile.
 */
export function useCurrentProfile() {
  const userId = useAuthStore((state) => state.session?.user.id);

  return useQuery({
    queryKey: ['profiles', 'current', userId ?? null],
    enabled: Boolean(userId),
    queryFn: async (): Promise<CurrentProfile | null> => {
      if (!userId) throw new Error('useCurrentProfile ran without a session');
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'id, display_name, bio, user_mode, rate_tier, city_id, work_public_id, work_media_type, face_public_id, city:cities(id, name, state)'
        )
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
