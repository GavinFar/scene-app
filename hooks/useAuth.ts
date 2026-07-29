import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import type { UserMode } from '@/constants/userModes';
import type { TablesInsert } from '@/types/database';

/**
 * Subscribes the Zustand auth store to Supabase auth events. Mounted once in
 * app/_layout.tsx. The INITIAL_SESSION event (fired after the stored session
 * loads from SecureStore) flips `isInitialized`, which gates the splash screen
 * and every redirect.
 */
export function useAuthListener() {
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => data.subscription.unsubscribe();
  }, [setSession]);
}

export interface SignUpInput {
  displayName: string;
  email: string;
  password: string;
  mode: UserMode;
  cityId: string;
}

export interface SignUpResult {
  /**
   * True when the Supabase project requires email confirmation: no session
   * yet, so the signup screen shows a "check your inbox" state instead of
   * navigating. The profile row is created on first login (see useSignIn).
   */
  needsEmailConfirmation: boolean;
}

/**
 * Creates the auth user (profile fields ride along as user metadata) and,
 * when a session comes back immediately, the profiles row.
 */
export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SignUpInput): Promise<SignUpResult> => {
      const { data, error } = await supabase.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: {
          data: {
            display_name: input.displayName.trim(),
            user_mode: input.mode,
            city_id: input.cityId,
          },
        },
      });
      if (error) throw error;
      if (!data.session || !data.user) {
        return { needsEmailConfirmation: true };
      }
      await ensureProfile(data.user);
      return { needsEmailConfirmation: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

export interface SignInInput {
  email: string;
  password: string;
}

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SignInInput) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email.trim(),
        password: input.password,
      });
      if (error) throw error;
      // Covers the confirm-email-then-login path, where signup ended with no
      // session and the profiles row could not be created under RLS.
      await ensureProfile(data.user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      // Drop every cached read — the next account must not see this one's data.
      queryClient.clear();
    },
  });
}

/**
 * Inserts the profiles row for a just-authenticated user if it doesn't exist,
 * built from the signup metadata. Runs under RLS as the user (owner-write).
 */
async function ensureProfile(user: User): Promise<void> {
  const { data: existing, error: selectError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();
  if (selectError) throw selectError;
  if (existing) return;

  const metadata = user.user_metadata;
  const displayName = typeof metadata.display_name === 'string' ? metadata.display_name : null;
  const userMode = isUserMode(metadata.user_mode) ? metadata.user_mode : null;
  const cityId = typeof metadata.city_id === 'string' ? metadata.city_id : null;

  // A user created outside the app's signup flow won't carry the metadata;
  // leave the profile for the edit-profile flow rather than insert junk.
  if (!displayName || !userMode || !cityId) return;

  const row: TablesInsert<'profiles'> = {
    id: user.id,
    display_name: displayName,
    user_mode: userMode,
    city_id: cityId,
  };
  const { error: insertError } = await supabase.from('profiles').insert(row);
  if (insertError) throw insertError;
}

function isUserMode(value: unknown): value is UserMode {
  return value === 'client' || value === 'pro' || value === 'up_and_coming';
}
