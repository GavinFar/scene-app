import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  /** Current Supabase session; null when signed out. */
  session: Session | null;
  /**
   * False until the first auth event arrives — gate redirects on this so the
   * app never flashes the wrong screen while the stored session loads.
   */
  isInitialized: boolean;
  /** Called on every Supabase auth event (slice 3 wires the listener). */
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  isInitialized: false,
  setSession: (session) => set({ session, isInitialized: true }),
}));
