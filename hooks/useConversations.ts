import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

export interface ConversationCounterpart {
  id: string;
  display_name: string;
  face_public_id: string | null;
}

export interface Conversation {
  counterpart: ConversationCounterpart;
  lastMessage: {
    id: string;
    body: string;
    created_at: string;
    /** True when the signed-in user sent it — rows prefix "You:". */
    isMine: boolean;
  };
  unreadCount: number;
}

// messages carries two FKs to profiles (sender + recipient) — disambiguate
// via FK constraint names. Single literal (type-parser contract).
const CONVERSATIONS_SELECT =
  'id, body, created_at, read_at, sender_id, recipient_id, sender:profiles!messages_sender_id_fkey(id, display_name, face_public_id), recipient:profiles!messages_recipient_id_fkey(id, display_name, face_public_id)';

/**
 * The DM inbox: every message involving the signed-in user, grouped
 * client-side into one row per counterpart (newest first) with an unread
 * count. There's no conversations table — the thread IS the message pair.
 * A realtime subscription keeps the inbox fresh while it's mounted.
 */
export function useConversations() {
  const userId = useAuthStore((state) => state.session?.user.id);
  const queryClient = useQueryClient();

  // Incoming messages bump the inbox even when the user is sitting on it.
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`messages-inbox-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${userId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return useQuery({
    queryKey: ['messages', 'conversations', userId ?? null],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Conversation[]> => {
      if (!userId) throw new Error('useConversations ran without a session');
      const { data, error } = await supabase
        .from('messages')
        .select(CONVERSATIONS_SELECT)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Newest-first, so the first message per counterpart is the preview.
      const byCounterpart = new Map<string, Conversation>();
      for (const message of data) {
        const isMine = message.sender_id === userId;
        const counterpart = isMine ? message.recipient : message.sender;
        if (!counterpart) continue; // dangling FK — counterpart profile gone

        const existing = byCounterpart.get(counterpart.id);
        const isUnread = !isMine && message.read_at == null;
        if (existing) {
          if (isUnread) existing.unreadCount += 1;
          continue;
        }
        byCounterpart.set(counterpart.id, {
          counterpart,
          lastMessage: {
            id: message.id,
            body: message.body,
            created_at: message.created_at,
            isMine,
          },
          unreadCount: isUnread ? 1 : 0,
        });
      }
      return [...byCounterpart.values()];
    },
  });
}
