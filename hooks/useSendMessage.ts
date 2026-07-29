import { useMutation, useQueryClient } from '@tanstack/react-query';

import { threadQueryKey } from '@/hooks/useThread';
import type { ThreadMessage } from '@/hooks/useThread';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

/**
 * Send a DM with optimistic UI (spec #13): the message appears in the thread
 * immediately, swaps to the server row on success, rolls back on error.
 */
export function useSendMessage(counterpartId: string) {
  const userId = useAuthStore((state) => state.session?.user.id);
  const queryClient = useQueryClient();
  const queryKey = threadQueryKey(userId, counterpartId);

  return useMutation({
    mutationFn: async (body: string): Promise<ThreadMessage> => {
      if (!userId) throw new Error('useSendMessage ran without a session');
      const { data, error } = await supabase
        .from('messages')
        .insert({ sender_id: userId, recipient_id: counterpartId, body })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ThreadMessage[]>(queryKey);

      const optimistic: ThreadMessage = {
        id: `optimistic-${Date.now()}`,
        sender_id: userId ?? '',
        recipient_id: counterpartId,
        body,
        created_at: new Date().toISOString(),
        read_at: null,
      };
      queryClient.setQueryData<ThreadMessage[]>(queryKey, (existing = []) => [
        ...existing,
        optimistic,
      ]);
      return { previous, optimisticId: optimistic.id };
    },
    onSuccess: (message, _body, context) => {
      // Reconcile: swap the optimistic row for the server row in place.
      queryClient.setQueryData<ThreadMessage[]>(queryKey, (existing = []) =>
        existing.map((entry) => (entry.id === context.optimisticId ? message : entry))
      );
    },
    onError: (_error, _body, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'conversations'] });
    },
  });
}
