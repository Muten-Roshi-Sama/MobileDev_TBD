import { z } from "zod";
import { protectedProcedure } from "../index";

export type ConversationEvent =
  | { type: "MESSAGE_SENT"; conversationId: string; message: any }
  | { type: "MESSAGE_DELETED"; conversationId: string; messageId: string }
  | { type: "USER_TYPING"; conversationId: string; userId: string }
  | { type: "USER_STOPPED_TYPING"; conversationId: string; userId: string };

type Listener = (event: ConversationEvent) => void;
const listeners = new Map<string, Set<Listener>>();

export function publishConversationEvent(
  conversationId: string,
  event: ConversationEvent
) {
  const subs = listeners.get(conversationId);
  if (subs) {
    for (const fn of subs) fn(event);
  }
}

function subscribeToConversation(
  conversationId: string,
  fn: Listener
): () => void {
  let subs = listeners.get(conversationId);
  if (!subs) {
    subs = new Set();
    listeners.set(conversationId, subs);
  }
  subs.add(fn);

  return () => {
    subs!.delete(fn);
    if (subs!.size === 0) listeners.delete(conversationId);
  };
}

export const streamRouter = {
  conversation: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .handler(async function* ({ input, signal, context }) {
      const { conversationId } = input;
      const userId = context.session.user.id;
      const eventQueue: ConversationEvent[] = [];
      let resolve: (() => void) | null = null;

      const unsubscribe = subscribeToConversation(
        conversationId,
        (event: ConversationEvent) => {
          eventQueue.push(event);
          resolve?.();
        }
      );

      const onAbort = () => resolve?.();
      signal?.addEventListener("abort", onAbort, { once: true });

      try {
        while (!signal?.aborted) {
          // Wait for the next event
          if (eventQueue.length === 0) {
            await new Promise<void>((r) => {
              resolve = r;
            });
          }

          // Drain all queued events
          while (eventQueue.length > 0) {
            yield eventQueue.shift()!;
          }
        }
      } finally {
        signal?.removeEventListener("abort", onAbort);
        unsubscribe();
      }
    }),
};