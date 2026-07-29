import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

export interface CatalogRole {
  slug: string;
  name: string;
  sort_order: number;
  department_slug: string;
}

export interface CatalogDepartment {
  slug: string;
  name: string;
  sort_order: number;
  roles: CatalogRole[];
}

/**
 * The full department → roles catalog for search filter chips and
 * department-to-role expansion. Lookup data — cached forever like useCities.
 */
export function useRolesCatalog() {
  return useQuery({
    queryKey: ['departments', 'catalog'],
    queryFn: async (): Promise<CatalogDepartment[]> => {
      const { data, error } = await supabase
        .from('departments')
        .select('slug, name, sort_order, roles(slug, name, sort_order, department_slug)')
        .order('sort_order');
      if (error) throw error;
      // Nested order isn't trustworthy with embeds — sort client-side.
      return data.map((department) => ({
        ...department,
        roles: [...department.roles].sort((a, b) => a.sort_order - b.sort_order),
      }));
    },
    staleTime: Infinity, // lookup data — changes only via migration
  });
}
