// packages/hooks/websocket/useConversationStream.ts
import { useEffect } from "react";
import { wsManager } from "./wsStream";
import { useQueryClient } from "@tanstack/react-query";
import type { orpc as ORPCType } from "../../../apps/web/src/utils/orpc";

/**
 * Simple hook: subscribes to server events for a conversationId.
 * Default behavior: invalidate the message list query so React Query refetches.
 * If you prefer appending the event to cache, you can swap invalidate -> setQueryData.
 */
export function useConversationStream(orpc: typeof ORPCType, conversationId?: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const unsub = wsManager.subscribe(conversationId, (event: any) => {
      if (event.type === "MESSAGE_SENT") {
        // SIMPLE: invalidate query so it refetches from server (MVP)
        qc.invalidateQueries(orpc.message.list.queryKey({ input: { conversationId } }));

        // ALTERNATIVE (append delta) - uncomment to use:
        // const key = orpc.message.list.queryKey({ input: { conversationId } });
        // qc.setQueryData(key, (old: any) => {
        //   if (!old) return old;
        //   // dedupe if needed (e.g., check existing ids)
        //   return { ...old, messages: [...(old.messages ?? []), event.message] };
        // });
      }
    });

    return () => unsub();
  }, [conversationId, orpc, qc]);
}