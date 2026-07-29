import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import type { Tables } from '@/types/database';

export type ThreadMessage = Tables<'messages'>;

/** Shared with useSendMessage so the optimistic write hits the same cache. */
export function threadQueryKey(userId: string | null | undefined, counterpartId: string) {
  return ['messages', 'thread', userId ?? null, counterpartId] as const;
}

/**
 * One DM thread (both directions, oldest first) with a Supabase Realtime
 * subscription: incoming messages from the counterpart append straight into
 * the cache. Opening the thread marks the counterpart's messages read.
 */
export function useThread(counterpartId: string | undefined) {
  const userId = useAuthStore((state) => state.session?.user.id);
  const queryClient = useQueryClient();

  const thread = useQuery({
    queryKey: threadQueryKey(userId, counterpartId ?? 'unknown'),
    enabled: Boolean(userId) && Boolean(counterpartId),
    queryFn: async (): Promise<ThreadMessage[]> => {
      if (!userId || !counterpartId) throw new Error('useThread ran without ids');
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${userId},recipient_id.eq.${counterpartId}),and(sender_id.eq.${counterpartId},recipient_id.eq.${userId})`
        )
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Realtime: append the counterpart's incoming messages without a refetch.
  useEffect(() => {
    if (!userId || !counterpartId) return;
    const channel = supabase
      .channel(`messages-thread-${counterpartId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${userId}` },
        (payload) => {
          const message = payload.new as ThreadMessage;
          if (message.sender_id !== counterpartId) return;
          queryClient.setQueryData<ThreadMessage[]>(
            threadQueryKey(userId, counterpartId),
            (existing = []) =>
              existing.some((entry) => entry.id === message.id)
                ? existing
                : [...existing, message]
          );
          queryClient.invalidateQueries({ queryKey: ['messages', 'conversations'] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, counterpartId, queryClient]);

  // Mark incoming messages read once they're on screen (recipient-only
  // update under RLS). The ref stops re-marking while the update is in
  // flight; the conversations invalidation clears the unread badge.
  const markedIds = useRef(new Set<string>());
  const messages = thread.data;
  useEffect(() => {
    if (!userId || !messages) return;
    const unreadIds = messages
      .filter(
        (message) =>
          message.recipient_id === userId &&
          message.read_at == null &&
          !markedIds.current.has(message.id)
      )
      .map((message) => message.id);
    if (unreadIds.length === 0) return;
    for (const id of unreadIds) markedIds.current.add(id);

    supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', unreadIds)
      .then(({ error }) => {
        if (error) {
          // Roll the guard back so a later pass can retry.
          for (const id of unreadIds) markedIds.current.delete(id);
          return;
        }
        queryClient.invalidateQueries({ queryKey: ['messages', 'conversations'] });
      });
  }, [messages, userId, queryClient]);

  return thread;
}
