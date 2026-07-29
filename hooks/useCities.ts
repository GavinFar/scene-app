import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export interface CityOption {
  id: string;
  name: string;
  state: string;
  slug: string;
  is_active: boolean;
}

/**
 * All launch cities for the "What's your scene?" picker. Active cities first
 * (only those are selectable); inactive ones render as "coming soon".
 * Readable by anon — the picker runs pre-auth on the signup screen.
 */
export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async (): Promise<CityOption[]> => {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, state, slug, is_active')
        .order('is_active', { ascending: false })
        .order('name');
      if (error) throw error;
      return data;
    },
    staleTime: Infinity, // lookup data — changes only via migration
  });
}
