import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CurrentProfile } from '@/hooks/useCurrentProfile';
import type { ProfileDetail, ProfileReview } from '@/hooks/useProfile';
import { hashPhone } from '@/lib/crypto';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import type { Enums } from '@/types/database';

export interface SubmitReviewInput {
  kind: Enums<'review_kind'>;
  /** 1–5, required for kind 'review'; forced NULL for recommendations (schema check). */
  rating: number | null;
  body: string;
  /** Raw phone; hashed via hashPhone before it ever leaves the device (spec #3). */
  employerPhone?: string;
}

// Same double-FK disambiguation as PROFILE_DETAIL_SELECT, and one literal —
// the supabase-js type parser can't handle concatenation or unions.
const SUBMITTED_REVIEW_SELECT =
  'id, kind, rating, body, created_at, author:profiles!reviews_and_recommendations_author_profile_id_fkey(id, display_name, face_public_id)';

/**
 * Submit a review or employer recommendation about a profile, with optimistic
 * UI (spec #13): it appears at the top of the subject's detail-sheet reviews
 * immediately, swaps to the server row on success, rolls back on error.
 * The employer phone is SHA-256 hashed here — the raw number is never stored.
 */
export function useSubmitReview(subjectId: string) {
  const userId = useAuthStore((state) => state.session?.user.id);
  const queryClient = useQueryClient();
  const detailKey = ['profiles', 'detail', subjectId];

  return useMutation({
    mutationFn: async (input: SubmitReviewInput): Promise<ProfileReview> => {
      if (!userId) throw new Error('useSubmitReview ran without a session');
      const phoneDigits = input.employerPhone?.replace(/\D/g, '') ?? '';
      const employerPhoneHash = phoneDigits ? await hashPhone(phoneDigits) : null;

      const { data, error } = await supabase
        .from('reviews_and_recommendations')
        .insert({
          author_profile_id: userId,
          subject_profile_id: subjectId,
          kind: input.kind,
          rating: input.kind === 'review' ? input.rating : null,
          body: input.body.trim(),
          employer_phone_hash: employerPhoneHash,
        })
        .select(SUBMITTED_REVIEW_SELECT)
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previous = queryClient.getQueryData<ProfileDetail | null>(detailKey);

      const me = queryClient.getQueryData<CurrentProfile | null>([
        'profiles',
        'current',
        userId ?? null,
      ]);
      const optimistic: ProfileReview = {
        id: `optimistic-${Date.now()}`,
        kind: input.kind,
        rating: input.kind === 'review' ? input.rating : null,
        body: input.body.trim(),
        created_at: new Date().toISOString(),
        author: me
          ? { id: me.id, display_name: me.display_name, face_public_id: me.face_public_id }
          : null,
      };
      queryClient.setQueryData<ProfileDetail | null>(detailKey, (existing) =>
        existing ? { ...existing, reviews: [optimistic, ...existing.reviews] } : existing
      );
      return { previous, optimisticId: optimistic.id };
    },
    onSuccess: (review, _input, context) => {
      // Reconcile: swap the optimistic entry for the server row in place.
      queryClient.setQueryData<ProfileDetail | null>(detailKey, (existing) =>
        existing
          ? {
              ...existing,
              reviews: existing.reviews.map((entry) =>
                entry.id === context.optimisticId ? review : entry
              ),
            }
          : existing
      );
    },
    onError: (_error, _input, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(detailKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: detailKey });
    },
  });
}
