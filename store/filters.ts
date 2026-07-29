import { create } from 'zustand';
import type { RateTier } from '@/constants/rateTiers';

interface FiltersState {
  /**
   * Free-text search phrase. Client mode resolves it to role slugs through
   * constants/roleSynonyms.ts (locked decision #4); Pro and Up-and-Coming
   * modes filter by role directly.
   */
  query: string;
  /** Role slugs to include (e.g. 'dp', 'gaffer'). Empty = all roles. */
  roles: string[];
  /** Department slugs to include. Empty = all departments. */
  departments: string[];
  /** City id from the cities table. Null = the user's own city. */
  cityId: string | null;
  /** Minimum self-rated experience dots (1–5). Null = any. */
  minExperience: number | null;
  /** Rate tiers to include. Empty = any. */
  rateTiers: RateTier[];
  setQuery: (query: string) => void;
  toggleRole: (slug: string) => void;
  toggleDepartment: (slug: string) => void;
  setCityId: (cityId: string | null) => void;
  setMinExperience: (dots: number | null) => void;
  toggleRateTier: (tier: RateTier) => void;
  resetFilters: () => void;
}

const initialFilters = {
  query: '',
  roles: [] as string[],
  departments: [] as string[],
  cityId: null as string | null,
  minExperience: null as number | null,
  rateTiers: [] as RateTier[],
};

function toggleItem<T>(list: T[], item: T): T[] {
  return list.includes(item)
    ? list.filter((existing) => existing !== item)
    : [...list, item];
}

export const useFiltersStore = create<FiltersState>()((set) => ({
  ...initialFilters,
  setQuery: (query) => set({ query }),
  toggleRole: (slug) => set((state) => ({ roles: toggleItem(state.roles, slug) })),
  toggleDepartment: (slug) =>
    set((state) => ({ departments: toggleItem(state.departments, slug) })),
  setCityId: (cityId) => set({ cityId }),
  setMinExperience: (dots) => set({ minExperience: dots }),
  toggleRateTier: (tier) =>
    set((state) => ({ rateTiers: toggleItem(state.rateTiers, tier) })),
  resetFilters: () => set(initialFilters),
}));
